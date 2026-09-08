import importlib.util
import json
import sqlite3
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

spec = importlib.util.spec_from_file_location('cuentas', Path(__file__).resolve().parents[1] / 'servidor/usuarios.py')
api = importlib.util.module_from_spec(spec)
spec.loader.exec_module(api)


class UsuariosTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.store = api.Cuentas(Path(self.tmp.name) / 'test.sqlite3')
        self.admin = self.store.save('Admin Prueba', role='admin')
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), api.handler(self.store, {'http://localhost'}))
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.token = self.store.login('Admin Prueba', self.admin['code'], 'test')['token']

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.tmp.cleanup()

    def request(self, path, method='GET', data=None, token=None):
        headers = {'Origin': 'http://localhost', 'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = 'Bearer ' + token
        req = urllib.request.Request(f'http://127.0.0.1:{self.server.server_port}/api{path}',
                                     data=json.dumps(data).encode() if data is not None else None,
                                     headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as response:
                return response.status, json.load(response)
        except urllib.error.HTTPError as error:
            with error:
                return error.code, json.load(error)

    def test_lifecycle_and_revocation(self):
        status, result = self.request('/users', 'POST', {'name': '  José   Prueba '}, self.token)
        self.assertEqual(status, 201)
        self.assertRegex(result['code'], r'^[0-9]{10}$')
        user_id = result['user']['id']
        self.assertEqual(self.request('/users', 'POST', {'name': 'JOSE PRUEBA'}, self.token)[0], 409)
        status, session = self.request('/login', 'POST', {'name': 'jose prueba', 'code': result['code']})
        self.assertEqual(status, 200)
        self.assertEqual(self.request('/users', token=session['token'])[0], 403)
        self.assertEqual(self.request('/users', 'POST', {'name': 'Intruso'}, session['token'])[0], 403)
        status, updated = self.request('/users/' + user_id, 'PATCH', {'name': 'Nuevo Usuario', 'regenerate': True}, self.token)
        self.assertEqual(status, 200)
        self.assertRegex(updated['code'], r'^[0-9]{10}$')
        self.assertEqual(self.request('/session', token=session['token'])[0], 401)
        self.assertEqual(self.request('/login', 'POST', {'name': 'Nuevo Usuario', 'code': result['code']})[0], 401)
        status, new_session = self.request('/login', 'POST', {'name': 'Nuevo Usuario', 'code': updated['code']})
        self.assertEqual(status, 200)
        self.assertEqual(self.request('/users/' + user_id, 'DELETE', token=self.token)[0], 200)
        self.assertEqual(self.request('/session', token=new_session['token'])[0], 401)
        self.assertEqual(self.request('/login', 'POST', {'name': 'Nuevo Usuario', 'code': updated['code']})[0], 401)

    def test_protection_and_private_storage(self):
        self.assertEqual(self.request('/users')[0], 401)
        self.assertEqual(self.request('/users/' + self.admin['user']['id'], 'DELETE', token=self.token)[0], 403)
        _, result = self.request('/users', token=self.token)
        self.assertNotIn('digest', json.dumps(result))
        self.assertNotIn(self.admin['code'], json.dumps(result))
        with self.store.connect() as db:
            row = db.execute('SELECT * FROM users').fetchone()
            self.assertNotIn(self.admin['code'], list(row))
        self.assertEqual(self.request('/users', 'POST', {'name': '  '}, self.token)[0], 400)

    def test_attempt_limit_and_persistence(self):
        person = self.store.save('usuario01')
        wrong = '1111111111' if person['code'] != '1111111111' else '2222222222'
        for _ in range(15):
            with self.assertRaises(PermissionError):
                self.store.login('usuario01', wrong, 'limited-ip')
        with self.assertRaisesRegex(PermissionError, 'Demasiados'):
            self.store.login('usuario01', person['code'], 'limited-ip')
        reopened = api.Cuentas(self.store.path)
        self.assertEqual(reopened.session(self.token)['role'], 'admin')


if __name__ == '__main__':
    unittest.main()
