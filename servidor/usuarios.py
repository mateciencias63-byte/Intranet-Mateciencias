"""API de cuentas. Ejecutar detrás de HTTPS; no sirve archivos del proyecto."""
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
import unicodedata
from contextlib import contextmanager
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def normalizar(name):
    return ' '.join(''.join(c for c in unicodedata.normalize('NFD', name)
                           if not unicodedata.combining(c)).upper().split())


def hash_codigo(code, salt):
    return hashlib.scrypt(code.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1).hex()


class Cuentas:
    def __init__(self, path):
        self.path = str(path)
        with self.connect() as db:
            db.executescript('''
              CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY, name TEXT NOT NULL, normalized TEXT NOT NULL UNIQUE,
                salt TEXT NOT NULL, digest TEXT NOT NULL, role TEXT NOT NULL,
                created INTEGER NOT NULL);
              CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires INTEGER NOT NULL);
              CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, count INTEGER, until INTEGER);
            ''')

    @contextmanager
    def connect(self):
        db = sqlite3.connect(self.path, timeout=10)
        db.row_factory = sqlite3.Row
        db.execute('PRAGMA foreign_keys=ON')
        try:
            with db:
                yield db
        finally:
            db.close()

    @staticmethod
    def public(row):
        return {k: row[k] for k in ('id', 'name', 'role', 'created')}

    def save(self, name, user_id=None, regenerate=False, role='user'):
        name = ' '.join(str(name).split())
        if not name or len(name) > 100 or any(ord(c) < 32 for c in name):
            raise ValueError('Escribe un nombre de usuario de 1 a 100 caracteres.')
        code = ''.join(str(secrets.randbelow(10)) for _ in range(10)) if not user_id or regenerate else None
        salt = secrets.token_hex(16) if code else None
        digest = hash_codigo(code, salt) if code else None
        with self.connect() as db:
            if user_id:
                old = db.execute('SELECT * FROM users WHERE id=?', (user_id,)).fetchone()
                if not old:
                    raise ValueError('El usuario ya no existe.')
                db.execute('UPDATE users SET name=?,normalized=?,salt=?,digest=? WHERE id=?',
                           (name, normalizar(name), salt or old['salt'], digest or old['digest'], user_id))
                # Editing a name or regenerating a code revokes old sessions.
                db.execute('DELETE FROM sessions WHERE user_id=?', (user_id,))
            else:
                user_id = secrets.token_hex(16)
                db.execute('INSERT INTO users VALUES (?,?,?,?,?,?,?)',
                           (user_id, name, normalizar(name), salt, digest, role, int(time.time())))
            row = db.execute('SELECT * FROM users WHERE id=?', (user_id,)).fetchone()
        return {'user': self.public(row), 'code': code}

    def login(self, name, code, address):
        now = int(time.time())
        normalized = normalizar(str(name))
        # Both per-account and per-IP limits; no proxy header is trusted.
        keys = [hashlib.sha256(('user:' + normalized).encode()).hexdigest(),
                hashlib.sha256(('ip:' + address).encode()).hexdigest()]
        with self.connect() as db:
            db.execute('DELETE FROM attempts WHERE until<?', (now,))
            for key in keys:
                attempt = db.execute('SELECT count FROM attempts WHERE key=?', (key,)).fetchone()
                if attempt and attempt['count'] >= 15:
                    raise PermissionError('Demasiados intentos. Espera 15 minutos.')
            row = db.execute('SELECT * FROM users WHERE normalized=?', (normalized,)).fetchone()
            salt = row['salt'] if row else '00' * 16
            valid = bool(re.fullmatch(r'[0-9]{10}', str(code)))
            candidate = hash_codigo(str(code) if valid else '0000000000', salt)
            if not row or not valid or not hmac.compare_digest(candidate, row['digest']):
                for key in keys:
                    db.execute('INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1',
                               (key, now + 900))
                result = None
            else:
                token = secrets.token_urlsafe(32)
                db.execute('DELETE FROM sessions WHERE expires<?', (now,))
                db.execute('INSERT INTO sessions VALUES (?,?,?)',
                           (hashlib.sha256(token.encode()).hexdigest(), row['id'], now + 28800))
                db.execute('DELETE FROM attempts WHERE key=?', (keys[0],))
                result = {'token': token, 'user': self.public(row)}
        if result is None:
            raise PermissionError('Usuario o código incorrecto.')
        return result

    def session(self, token):
        with self.connect() as db:
            row = db.execute('SELECT u.* FROM users u JOIN sessions s ON u.id=s.user_id '
                             'WHERE s.token=? AND s.expires>?',
                             (hashlib.sha256(token.encode()).hexdigest(), int(time.time()))).fetchone()
        return self.public(row) if row else None


def handler(store, origins):
    class API(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass  # Never log codes, bearer tokens or request bodies.

        def reply(self, status, data=None):
            body = json.dumps(data or {}, ensure_ascii=False).encode()
            self.send_response(status)
            origin = self.headers.get('Origin', '')
            if origin in origins:
                self.send_header('Access-Control-Allow-Origin', origin)
                self.send_header('Vary', 'Origin')
            self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def do_OPTIONS(self):
            self.reply(204)

        def dispatch(self):
            if self.headers.get('Origin') and self.headers['Origin'] not in origins:
                return self.reply(403, {'error': 'Origen no autorizado.'})
            try:
                size = int(self.headers.get('Content-Length', 0))
                if size < 0 or size > 4096:
                    return self.reply(413, {'error': 'Solicitud demasiado grande.'})
                data = json.loads(self.rfile.read(size) or b'{}')
                if not isinstance(data, dict):
                    raise ValueError('Solicitud inválida.')
                token = self.headers.get('Authorization', '').removeprefix('Bearer ')
                path = self.path.split('?', 1)[0]
                if path == '/api/login' and self.command == 'POST':
                    return self.reply(200, store.login(data.get('name', ''), data.get('code', ''), self.client_address[0]))
                user = store.session(token)
                if not user:
                    return self.reply(401, {'error': 'Inicia sesión con tu usuario y código.'})
                if path == '/api/session' and self.command == 'GET':
                    return self.reply(200, {'user': user})
                if path == '/api/logout' and self.command == 'POST':
                    with store.connect() as db:
                        db.execute('DELETE FROM sessions WHERE token=?', (hashlib.sha256(token.encode()).hexdigest(),))
                    return self.reply(200)
                if user['role'] != 'admin':
                    return self.reply(403, {'error': 'Solo el administrador puede gestionar usuarios.'})
                if path == '/api/users' and self.command == 'GET':
                    with store.connect() as db:
                        rows = db.execute('SELECT * FROM users ORDER BY created,name').fetchall()
                    return self.reply(200, {'users': [store.public(row) for row in rows]})
                if path == '/api/users' and self.command == 'POST':
                    return self.reply(201, store.save(data.get('name', '')))
                match = re.fullmatch('/api/users/([a-f0-9]{32})', path)
                if match and self.command in ('PATCH', 'DELETE'):
                    user_id = match[1]
                    with store.connect() as db:
                        target = db.execute('SELECT role FROM users WHERE id=?', (user_id,)).fetchone()
                    if not target:
                        return self.reply(404, {'error': 'El usuario ya no existe.'})
                    if target['role'] == 'admin':
                        return self.reply(403, {'error': 'La cuenta administradora está protegida.'})
                    if self.command == 'PATCH':
                        return self.reply(200, store.save(data.get('name', ''), user_id, data.get('regenerate') is True))
                    with store.connect() as db:
                        db.execute('DELETE FROM users WHERE id=?', (user_id,))
                    return self.reply(200)
                self.reply(404, {'error': 'Ruta no encontrada.'})
            except sqlite3.IntegrityError:
                self.reply(409, {'error': 'Ya existe un usuario con ese nombre.'})
            except PermissionError as error:
                self.reply(401, {'error': str(error)})
            except (ValueError, TypeError):
                self.reply(400, {'error': 'Revisa el nombre y los datos enviados.'})
            except Exception:
                self.reply(500, {'error': 'No se pudo completar la operación. Intenta nuevamente.'})

        do_GET = do_POST = do_PATCH = do_DELETE = dispatch
    return API


if __name__ == '__main__':
    db_path = Path(os.environ.get('USUARIOS_DB', str(Path.home() / '.mateciencias' / 'usuarios.sqlite3')))
    db_path.parent.mkdir(parents=True, exist_ok=True)
    store = Cuentas(db_path)
    with store.connect() as db:
        has_admin = db.execute("SELECT 1 FROM users WHERE role='admin'").fetchone()
    if not has_admin:
        initial = store.save(os.environ.get('ADMIN_NAME', 'MateCiencias Adm'), role='admin')
        print('Cuenta administradora inicial:', initial['user']['name'], flush=True)
        print('Código inicial (guardar ahora):', initial['code'], flush=True)
    origins = set(os.environ.get('USUARIOS_ORIGINS', 'http://localhost:8000,http://127.0.0.1:8000').split(','))
    server = ThreadingHTTPServer((os.environ.get('HOST', '127.0.0.1'), int(os.environ.get('PORT', '8080'))), handler(store, origins))
    print('API de usuarios iniciada.', flush=True)
    server.serve_forever()
