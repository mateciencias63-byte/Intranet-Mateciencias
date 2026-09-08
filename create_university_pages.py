from pathlib import Path

root = Path(__file__).resolve().parent
base_dir = root / "tarjetas" / "aula-virtual"

records = [
    ("BECA-18", "BECA 18", "Beca18.png", "BECA2026"),
    ("COAR", "COAR", "COAR.png", "COAR2026"),
    ("PUCP", "PUCP", "PUCP.png", "PUCP2026"),
    ("UDEP", "UDEP", "UDEP.png", "UDEP2026"),
    ("ULIMA", "Universidad de Lima", "ULIMA.png", "ULIMA2026"),
    ("UNAP", "UNAP", "UNAP.png", "UNAP2026"),
    ("UNC", "UNC", "UNC.png", "UNC2026"),
    ("UNCA", "UNCA", "UNCA.png", "UNCA2026"),
    ("UNCP", "UNCP", "UNCP.png", "UNCP2026"),
    ("UNF", "UNF", "UNF.jpg", "UNF2026"),
    ("UNFV", "UNFV", "UNFV.png", "UNFV2026"),
    ("UNI", "UNI", "UNI.png", "UNI2026"),
    ("UNMSM", "UNMSM", "UNMSM.png", "UNMSM2026"),
    ("UNP", "UNP", "UNP.png", "UNP20263"),
    ("UNPRG", "UNPRG", "UNPRG.png", "UNPRG2026"),
    ("UNSA", "UNSA", "UNSA.png", "UNSA2026"),
    ("UNSAAC", "UNSAAC", "UNSAAC.jpg", "UNSAAC2026"),
    ("UNSCH", "UNSCH", "UNSCH.png", "UNSCH2026"),
    ("UNT", "UNT", "UNT.png", "UNT2026"),
    ("UNTUMBES", "UNTUMBES", "UNTUMBES.png", "UNTUMBES2026"),
    ("UP", "Universidad del Pacífico", "UPacifico.png", "UP2026"),
]

base_html = '''<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | Aula Virtual</title>
    <style>
      * {{ box-sizing: border-box; }}
      body {{
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        background: linear-gradient(135deg, rgba(11, 57, 100, 0.88), rgba(16, 121, 86, 0.82)),
                    url('../../../fondo.png') center/cover no-repeat;
      }}
      .access-shell {{ min-height: 100vh; display: grid; place-items: center; padding: 24px; }}
      .access-card {{ width: min(520px, 100%); background: rgba(255,255,255,0.96); border-radius: 24px; padding: 30px 26px; box-shadow: 0 18px 50px rgba(15,41,80,.20); }}
      .access-brand {{ text-align: center; margin-bottom: 22px; }}
      .access-logo {{ width: 110px; height: 110px; object-fit: contain; margin-bottom: 10px; }}
      .access-brand h1 {{ margin: 0 0 8px; color: #0f172a; font-size: clamp(1.5rem, 2vw, 2.1rem); }}
      .access-brand p {{ margin: 0; color: #334155; font-weight: 700; }}
      .access-form {{ display: grid; gap: 16px; }}
      .access-field {{ display: grid; gap: 8px; font-weight: 700; color: #0f172a; }}
      .access-field input, .access-field select {{ width: 100%; padding: 12px 14px; border: 1px solid #dfe9f5; border-radius: 12px; background: #f8fbff; color: #0f172a; font-size: 1rem; }}
      .access-submit {{ border: none; border-radius: 12px; padding: 14px 18px; background: linear-gradient(135deg, #0c8f46, #0a7d3d); color: white; font-weight: 800; cursor: pointer; }}
      .unp-hidden {{ display: none !important; }}
      .unp-main {{ min-height: 100vh; background: #edf5f8; padding: 24px; }}
      .unp-content-panel {{ max-width: 1200px; margin: 0 auto; background: #fff; border-radius: 26px; overflow: hidden; box-shadow: 0 20px 50px rgba(15,41,80,.12); display: grid; grid-template-columns: 290px 1fr; }}
      .unp-sidebar-menu {{ background: linear-gradient(180deg, #0f172a, #113f5c); color: #fff; padding: 24px 18px; }}
      .unp-sidebar-profile {{ display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }}
      .unp-sidebar-avatar {{ width: 52px; height: 52px; border-radius: 50%; display: grid; place-items: center; font-weight: 900; background: linear-gradient(135deg, #a5f3fc, #34d399); color: #0f172a; }}
      .unp-sidebar-name {{ font-weight: 800; }}
      .unp-sidebar-career {{ font-size: 0.75rem; opacity: 0.8; }}
      .unp-menu-list {{ display: grid; gap: 12px; }}
      .unp-menu-item {{ display: block; padding: 14px 16px; border-radius: 14px; text-decoration: none; color: #e2e8f0; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); font-weight: 700; }}
      .unp-module-container {{ padding: 26px; }}
      .study-dashboard {{ background: linear-gradient(180deg, #f8fbff, #f3f7fa); border: 1px solid #dfeaf3; border-radius: 22px; padding: 24px; }}
      .study-header {{ display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; }}
      .study-header h1 {{ margin: 0; color: #0f172a; font-size: clamp(1.7rem, 2vw, 2.3rem); }}
      .study-badge {{ background: #dff7ec; color: #0f7c44; border-radius: 999px; padding: 8px 12px; font-weight: 800; }}
      .dashboard-grid {{ display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 18px; }}
      .dashboard-card {{ background: white; border: 1px solid #e5edf7; border-radius: 18px; padding: 20px; box-shadow: 0 8px 24px rgba(15,41,80,.04); }}
      .dashboard-icon {{ font-size: 1.8rem; margin-bottom: 10px; }}
      .dashboard-card h3 {{ margin: 0 0 8px; color: #0f172a; }}
      .dashboard-card p {{ margin: 0; color: #475569; line-height: 1.55; }}
      @media (max-width: 800px) {{ .unp-content-panel {{ grid-template-columns: 1fr; }} .dashboard-grid {{ grid-template-columns: 1fr; }} .study-header {{ flex-direction: column; align-items: flex-start; }} }}
    </style>
  </head>
  <body>
    <div class="access-shell" id="loginShell">
      <div class="access-card">
        <div class="access-brand">
          <img class="access-logo" src="../../../{logo}" alt="{title}" />
          <h1>{title}</h1>
          <p>Acceso institucional para estudiantes de {title}.</p>
        </div>

        <form class="access-form" id="accessForm">
          <label class="access-field">
            Nombre completo
            <input type="text" id="studentName" placeholder="Ingrese su nombre y apellidos" required />
          </label>

          <label class="access-field">
            Código de estudiante
            <input type="text" id="studentCode" placeholder="Ingrese su código" value="{code}" required />
          </label>

          <label class="access-field">
            Carrera
            <select id="studentCareer" required>
              <option value="">Seleccione su carrera</option>
              <option>Administración</option>
              <option>Agronomía</option>
              <option>Arquitectura</option>
              <option>Biología</option>
              <option>Comunicación</option>
              <option>Contabilidad</option>
              <option>Derecho</option>
              <option>Economía</option>
              <option>Educación</option>
              <option>Enfermería</option>
              <option>Estadística</option>
              <option>Física</option>
              <option>Ingeniería</option>
              <option>Ingeniería Civil</option>
              <option>Ingeniería Informática</option>
              <option>Marketing</option>
              <option>Matemática</option>
              <option>Medicina Humana</option>
              <option>Psicología</option>
              <option>Sociología</option>
              <option>Turismo</option>
            </select>
          </label>

          <button class="access-submit" type="submit">INGRESAR AL AULA VIRTUAL</button>
        </form>
      </div>
    </div>

    <div id="panelWrapper" class="unp-hidden">
      <main class="unp-main">
        <section class="unp-content-panel">
          <aside class="unp-sidebar-menu">
            <div class="unp-sidebar-profile">
              <div class="unp-sidebar-avatar" id="studentAvatar">J</div>
              <div>
                <div class="unp-sidebar-name" id="profileName">Nombre Completo</div>
                <div class="unp-sidebar-career" id="profileCareer">Carrera</div>
              </div>
            </div>
            <nav class="unp-menu-list">
              <a class="unp-menu-item" href="#">📚 Material</a>
              <a class="unp-menu-item" href="#">🎥 Clases</a>
              <a class="unp-menu-item" href="#">📋 Exámenes</a>
              <a class="unp-menu-item" href="#">💬 Chat</a>
              <a class="unp-menu-item" href="#">💳 Pagos</a>
              <a class="unp-menu-item" href="#">📊 Mis Notas</a>
              <a class="unp-menu-item" href="#">📝 Simulacros</a>
            </nav>
          </aside>

          <section class="unp-module-container">
            <div class="study-dashboard">
              <div class="study-header">
                <h1>Bienvenido a {title}</h1>
                <span class="study-badge">Aula virtual activa</span>
              </div>

              <div class="dashboard-grid">
                <article class="dashboard-card"><div class="dashboard-icon">📚</div><h3>Material académico</h3><p>Accede a apuntes, recursos y contenidos de apoyo para cada curso.</p></article>
                <article class="dashboard-card"><div class="dashboard-icon">🎥</div><h3>Clases en vivo</h3><p>Consulta sesiones virtuales, videoclases y contenidos complementarios.</p></article>
                <article class="dashboard-card"><div class="dashboard-icon">📋</div><h3>Evaluaciones</h3><p>Revisa tareas, exámenes y seguimientos para potenciar tu rendimiento.</p></article>
                <article class="dashboard-card"><div class="dashboard-icon">💬</div><h3>Comunidad estudiantil</h3><p>Comunícate con tus compañeros y participa activamente en la comunidad.</p></article>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>

    <script>
      const loginShell = document.getElementById('loginShell');
      const panelWrapper = document.getElementById('panelWrapper');

      document.getElementById('accessForm').addEventListener('submit', function (event) {{
        event.preventDefault();
        const name = document.getElementById('studentName').value.trim();
        const code = document.getElementById('studentCode').value.trim();
        const career = document.getElementById('studentCareer').value.trim();

        if (!name || !code || !career) {{
          alert('Por favor complete todos los campos para ingresar al aula virtual.');
          return;
        }}

        sessionStorage.setItem('aulaUser', name);
        sessionStorage.setItem('aulaCode', code);
        sessionStorage.setItem('aulaCareer', career);

        loginShell.classList.add('unp-hidden');
        panelWrapper.classList.remove('unp-hidden');

        document.getElementById('studentAvatar').textContent = name.charAt(0).toUpperCase();
        document.getElementById('profileName').textContent = name;
        document.getElementById('profileCareer').textContent = career;
      }});
    </script>
  </body>
</html>
'''

for folder_name, title, logo, code in records:
    folder = base_dir / folder_name
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / "index.html"
    target.write_text(base_html.format(title=title, logo=logo, code=code), encoding="utf-8")
    print(f"Creado: {target.relative_to(root)}")

print(f"\nTotal: {len(records)} páginas creadas.")
