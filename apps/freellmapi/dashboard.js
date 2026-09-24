/**
 * FreeLLMAPI Sovereign Web Dashboard v2.5.0
 * Pure Zero-Dependency HTML/CSS/JS Single-Page Interface
 */
export function getDashboardHtml({ version = "2.5.0", dbPath = "/mnt/localstorage/freellmapi/freellmapi.db" } = {}) {
  return `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FreeLLMAPI Sovereign Gateway | Glamur</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #0f172a;
      --card-border: #1e293b;
      --card-hover: #172554;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.25);
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.2);
      --warning: #f59e0b;
      --warning-glow: rgba(245, 158, 11, 0.2);
      --danger: #ef4444;
      --danger-glow: rgba(239, 68, 68, 0.2);
      --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
    }
    /* Header */
    header {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--card-border);
      padding: 1rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 800;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .brand-badge {
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      color: #fff;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .header-badges {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.8rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      border: 1px solid var(--card-border);
      background: #1e293b;
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }
    .badge.active {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .btn {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      border: 1px solid var(--card-border);
      background: #1e293b;
      color: var(--text-main);
      transition: all 0.15s ease;
      font-family: var(--font-sans);
    }
    .btn:hover { background: #334155; border-color: #475569; }
    .btn-primary {
      background: #0284c7;
      border-color: #0284c7;
      color: #fff;
    }
    .btn-primary:hover { background: #0369a1; border-color: #0369a1; }
    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.3); }

    /* Main Container */
    main {
      flex: 1;
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    .metric-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .metric-title {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: #fff;
      font-family: var(--font-mono);
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }
    .metric-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* Tabs */
    .tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.25rem;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.6rem 1rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
    }
    .tab-btn:hover { color: #fff; }
    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }

    /* Tab Content */
    .tab-pane { display: none; }
    .tab-pane.active { display: flex; flex-direction: column; gap: 1.25rem; }

    /* Pools Grid */
    .pools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.25rem;
    }
    .pool-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .pool-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.6rem;
    }
    .pool-name {
      font-weight: 700;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .pool-tier {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      background: #1e293b;
      color: var(--accent);
    }
    .key-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #090d16;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
    }
    .key-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .key-account {
      font-weight: 600;
      color: #f1f5f9;
      font-family: var(--font-mono);
    }
    .key-stats {
      font-size: 0.7rem;
      color: var(--text-muted);
      display: flex;
      gap: 0.6rem;
    }
    .key-status {
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .key-status.healthy { color: var(--success); }
    .key-status.cooldown { color: var(--warning); }

    /* Playground */
    .playground-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      .playground-layout { grid-template-columns: 1fr; }
    }
    .panel {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .panel-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    select, input, textarea {
      background: #090d16;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.6rem 0.8rem;
      color: #f8fafc;
      font-family: inherit;
      font-size: 0.85rem;
      transition: border-color 0.15s;
    }
    select:focus, input:focus, textarea:focus {
      outline: none;
      border-color: var(--accent);
    }
    textarea {
      resize: vertical;
      font-family: var(--font-mono);
      font-size: 0.8rem;
    }
    .output-box {
      flex: 1;
      background: #090d16;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1rem;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      white-space: pre-wrap;
      word-break: break-word;
      min-height: 280px;
      overflow-y: auto;
      color: #e2e8f0;
    }
    .routed-info {
      display: flex;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-family: var(--font-mono);
    }

    /* Auth Overlay */
    .auth-overlay {
      position: fixed;
      inset: 0;
      background: rgba(9, 13, 22, 0.92);
      backdrop-filter: blur(16px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .auth-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      width: 100%;
      max-width: 420px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    .auth-title {
      font-size: 1.35rem;
      font-weight: 800;
      text-align: center;
      color: #fff;
    }
    .auth-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-align: center;
      margin-top: -0.5rem;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="brand">
      <span>⚡ FreeLLMAPI</span>
      <span class="brand-badge">Sovereign v${version}</span>
    </div>
    <div class="header-badges">
      <div class="badge active"><span class="dot"></span> Online</div>
      <div class="badge">SQLite WAL</div>
      <div class="badge" title="${dbPath}">Volume: /mnt/localstorage</div>
      <button class="btn" onclick="fetchStatus()">↻ Actualizar</button>
      <button class="btn btn-danger" onclick="logout()">Salir</button>
    </div>
  </header>

  <!-- Main Content -->
  <main>
    <!-- Top Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <span class="metric-title">Claves en el Pool</span>
        <div class="metric-value" id="metric-keys">-</div>
        <span class="metric-sub" id="metric-keys-sub">Ingestadas en SQLite</span>
      </div>
      <div class="metric-card">
        <span class="metric-title">Proveedores Activos</span>
        <div class="metric-value" id="metric-providers">-</div>
        <span class="metric-sub">Groq, Cerebras, OpenRouter, OpenCode...</span>
      </div>
      <div class="metric-card">
        <span class="metric-title">Peticiones Exitosas</span>
        <div class="metric-value" id="metric-success" style="color: #34d399;">-</div>
        <span class="metric-sub">Completions 200 OK</span>
      </div>
      <div class="metric-card">
        <span class="metric-title">Límites 429 / Cooldowns</span>
        <div class="metric-value" id="metric-429" style="color: #fbbf24;">-</div>
        <span class="metric-sub">Auto-rotación intra-pool activa</span>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('pools', this)">🔑 Pools de Proveedores</button>
      <button class="tab-btn" onclick="switchTab('playground', this)">⚡ Playground de Inferencia</button>
      <button class="tab-btn" onclick="switchTab('import', this)">📥 Cargar / Ingestar Claves</button>
      <button class="tab-btn" onclick="switchTab('storage', this)">💾 Storage & Diagnóstico</button>
    </div>

    <!-- Tab 1: Pools -->
    <div id="tab-pools" class="tab-pane active">
      <div class="pools-grid" id="pools-container">
        <div style="color: var(--text-muted); font-size: 0.9rem;">Cargando estado de proveedores...</div>
      </div>
    </div>

    <!-- Tab 2: Playground -->
    <div id="tab-playground" class="tab-pane">
      <div class="playground-layout">
        <div class="panel">
          <div class="panel-title">
            <span>Configuración de Consulta</span>
            <span class="badge" id="pg-status-badge">Listo</span>
          </div>

          <div class="form-group">
            <label class="form-label">Modelo / Directiva de Enrutamiento</label>
            <select id="pg-model">
              <option value="auto:balanced" selected>auto:balanced (Groq -> Cerebras -> OpenCode -> OpenRouter)</option>
              <option value="auto:fast">auto:fast (Ultra-baja latencia LPU Cerebras/Groq)</option>
              <option value="auto:smart">auto:smart (Razonamiento y Programación OpenCode/OpenRouter)</option>
              <option value="auto:reliable">auto:reliable (Ordenado por menor tasa de error)</option>
              <option value="groq/qwen/qwen3.8-27b">groq/qwen/qwen3.8-27b (Groq Directo)</option>
              <option value="cerebras/llama3.1-8b">cerebras/llama3.1-8b (Cerebras Directo)</option>
              <option value="openrouter/qwen/qwen3.8-27b:free">openrouter/qwen/qwen3.8-27b:free</option>
              <option value="opencode/qwen-2.5-coder-32b">opencode/qwen-2.5-coder-32b (OpenCode Coding)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">System Prompt</label>
            <input type="text" id="pg-system" value="Eres un asistente soberano de alta inteligencia en el ecosistema Glamur. Responde de forma concisa y técnica.">
          </div>

          <div class="form-group">
            <label class="form-label">Mensaje del Usuario</label>
            <textarea id="pg-prompt" rows="5">Hola, por favor confírmame tu nombre de modelo, tu proveedor y que estás respondiendo desde el proxy FreeLLMAPI en Zerops.</textarea>
          </div>

          <div style="display: flex; gap: 1rem;">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Temperatura: <span id="temp-val">0.7</span></label>
              <input type="range" id="pg-temp" min="0" max="1" step="0.1" value="0.7" oninput="document.getElementById('temp-val').textContent = this.value">
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Max Tokens: <span id="tokens-val">512</span></label>
              <input type="range" id="pg-tokens" min="64" max="2048" step="64" value="512" oninput="document.getElementById('tokens-val').textContent = this.value">
            </div>
          </div>

          <button class="btn btn-primary" style="justify-content: center; padding: 0.75rem;" onclick="runInference()" id="pg-btn">
            🚀 Ejecutar Inferencia en Vivo
          </button>
        </div>

        <div class="panel">
          <div class="panel-title">
            <span>Respuesta en Tiempo Real</span>
            <div class="routed-info" id="routed-badges" style="display: none;">
              <span class="badge active" id="badge-provider">provider</span>
              <span class="badge" id="badge-account">account</span>
              <span class="badge" id="badge-latency">0ms</span>
            </div>
          </div>
          <div class="output-box" id="pg-output">Presiona "Ejecutar Inferencia" para probar la respuesta del cluster.</div>
        </div>
      </div>
    </div>

    <!-- Tab 3: Import -->
    <div id="tab-import" class="tab-pane">
      <div class="panel" style="max-width: 800px; margin: 0 auto; width: 100%;">
        <div class="panel-title">
          <span>Ingesta de Claves en Caliente (AES-256-GCM)</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted);">
          Podés pegar el contenido de tus archivos Markdown (como <code>baiosfera_freellm.md</code> o <code>damaren_freellm.md</code>) o un array JSON. Las claves serán encriptadas con AES-256-GCM y persistidas en <code>/mnt/localstorage/freellmapi/freellmapi.db</code>.
        </p>

        <div class="form-group">
          <label class="form-label">Etiqueta de Cuenta</label>
          <input type="text" id="import-label" value="manual-ingest" placeholder="Ej: baiosfera, damaren, cluster-pro">
        </div>

        <div class="form-group">
          <label class="form-label">Contenido Markdown o JSON</label>
          <textarea id="import-content" rows="10" placeholder="Pega aquí el texto con tablas de markdown o JSON..."></textarea>
        </div>

        <button class="btn btn-primary" onclick="submitImport()">
          🔐 Encriptar y Cargar al Pool
        </button>
        <div id="import-feedback" style="font-size: 0.85rem; margin-top: 0.5rem;"></div>
      </div>
    </div>

    <!-- Tab 4: Storage -->
    <div id="tab-storage" class="tab-pane">
      <div class="panel" style="max-width: 800px; margin: 0 auto; width: 100%;">
        <div class="panel-title">
          <span>Diagnóstico de Almacenamiento Local y Persistencia</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.8rem; font-size: 0.85rem;">
          <div class="key-row">
            <span>Ruta Base de Datos SQLite:</span>
            <code style="color: var(--accent);">${dbPath}</code>
          </div>
          <div class="key-row">
            <span>Modo de Diario (Journal Mode):</span>
            <span class="badge active">WAL (Write-Ahead Logging)</span>
          </div>
          <div class="key-row">
            <span>Sincronización POSIX:</span>
            <span class="badge active">PRAGMA synchronous = NORMAL</span>
          </div>
          <div class="key-row">
            <span>Volumen Zerops Montado:</span>
            <span class="badge active">/mnt/localstorage (local-storage:single@1)</span>
          </div>
        </div>

        <div style="margin-top: 1rem;">
          <button class="btn btn-danger" onclick="resetAllCooldowns()">
            ⚡ Restablecer Todos los Cooldowns (Reset Global 429)
          </button>
        </div>
      </div>
    </div>
  </main>

  <!-- Login Modal -->
  <div id="auth-modal" class="auth-overlay" style="display: none;">
    <div class="auth-card">
      <div style="font-size: 2.2rem; text-align: center;">⚡</div>
      <h2 class="auth-title">FreeLLMAPI Sovereign</h2>
      <p class="auth-desc">Ingresá la contraseña maestra de administrador para gestionar el pool de claves y playground.</p>
      <div class="form-group">
        <label class="form-label">Contraseña de Administrador</label>
        <input type="password" id="auth-pwd" placeholder="Ingresá tu contraseña..." onkeydown="if(event.key==='Enter') login()">
      </div>
      <button class="btn btn-primary" style="justify-content: center; padding: 0.75rem;" onclick="login()">
        Acceder al Dashboard
      </button>
      <div id="auth-error" style="color: var(--danger); font-size: 0.8rem; text-align: center; display: none;"></div>
    </div>
  </div>

  <script>
    let token = localStorage.getItem('freellm_token') || '';

    function checkAuth() {
      if (!token) {
        document.getElementById('auth-modal').style.display = 'flex';
      } else {
        document.getElementById('auth-modal').style.display = 'none';
        fetchStatus();
      }
    }

    async function login() {
      const pwd = document.getElementById('auth-pwd').value.trim();
      const errEl = document.getElementById('auth-error');
      errEl.style.display = 'none';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd })
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          token = data.token;
          localStorage.setItem('freellm_token', token);
          document.getElementById('auth-modal').style.display = 'none';
          fetchStatus();
        } else {
          errEl.textContent = data.error || 'Contraseña incorrecta';
          errEl.style.display = 'block';
        }
      } catch (err) {
        errEl.textContent = 'Error al conectar con el servidor';
        errEl.style.display = 'block';
      }
    }

    function logout() {
      localStorage.removeItem('freellm_token');
      token = '';
      checkAuth();
    }

    function switchTab(tabId, btn) {
      document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tabId).classList.add('active');
      btn.classList.add('active');
    }

    async function fetchStatus() {
      if (!token) return;
      try {
        const res = await fetch('/api/status?token=' + encodeURIComponent(token));
        if (res.status === 401) {
          logout();
          return;
        }
        const data = await res.json();
        renderStatus(data);
      } catch (err) {
        console.error('Error fetching status:', err);
      }
    }

    function renderStatus(data) {
      const pools = data.activePools || [];
      let totalKeys = 0;
      let totalSuccess = 0;
      let total429 = 0;

      const container = document.getElementById('pools-container');
      container.innerHTML = '';

      pools.forEach(pool => {
        totalKeys += pool.totalKeys;
        const card = document.createElement('div');
        card.className = 'pool-card';

        let keysHtml = '';
        pool.keys.forEach(k => {
          totalSuccess += (k.successCount || 0);
          total429 += (k.rateLimit429Count || 0);

          const isCd = k.inCooldown;
          const statusClass = isCd ? 'cooldown' : 'healthy';
          const statusText = isCd ? '⏳ Cooldown (' + k.cooldownSecondsRemaining + 's)' : '● Activa';

          keysHtml += \`
            <div class="key-row">
              <div class="key-info">
                <span class="key-account">\${k.account}</span>
                <span class="key-stats">OK: \${k.successCount} | 429: \${k.rateLimit429Count} | Err: \${k.errorCount}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="key-status \${statusClass}">\${statusText}</span>
                \${isCd ? '<button class="btn" style="padding: 0.2rem 0.4rem; font-size: 0.7rem;" onclick="resetKeyCooldown(\\'' + k.id + '\\')">Reset</button>' : ''}
              </div>
            </div>
          \`;
        });

        card.innerHTML = \`
          <div class="pool-header">
            <span class="pool-name">🌐 \${pool.provider.toUpperCase()}</span>
            <span class="badge active">\${pool.activeKeys} / \${pool.totalKeys} Activas</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            \${keysHtml}
          </div>
        \`;
        container.appendChild(card);
      });

      document.getElementById('metric-keys').textContent = totalKeys;
      document.getElementById('metric-providers').textContent = pools.length;
      document.getElementById('metric-success').textContent = totalSuccess;
      document.getElementById('metric-429').textContent = total429;
    }

    async function runInference() {
      const model = document.getElementById('pg-model').value;
      const system = document.getElementById('pg-system').value;
      const prompt = document.getElementById('pg-prompt').value;
      const temp = parseFloat(document.getElementById('pg-temp').value);
      const max_tokens = parseInt(document.getElementById('pg-tokens').value);

      const outputEl = document.getElementById('pg-output');
      const btn = document.getElementById('pg-btn');
      const routedInfo = document.getElementById('routed-badges');
      const badgeProvider = document.getElementById('badge-provider');
      const badgeAccount = document.getElementById('badge-account');
      const badgeLatency = document.getElementById('badge-latency');

      outputEl.textContent = 'Enviando petición a FreeLLMAPI...';
      btn.disabled = true;
      routedInfo.style.display = 'none';

      const startTime = performance.now();

      try {
        const res = await fetch('/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: prompt }
            ],
            temperature: temp,
            max_tokens: max_tokens
          })
        });

        const elapsed = Math.round(performance.now() - startTime);
        const data = await res.json();

        const provider = res.headers.get('x-routed-provider') || 'auto';
        const account = res.headers.get('x-routed-account') || 'default';

        badgeProvider.textContent = 'Provider: ' + provider;
        badgeAccount.textContent = 'Account: ' + account;
        badgeLatency.textContent = elapsed + 'ms';
        routedInfo.style.display = 'flex';

        if (data.choices && data.choices[0] && data.choices[0].message) {
          outputEl.textContent = data.choices[0].message.content;
        } else {
          outputEl.textContent = JSON.stringify(data, null, 2);
        }
        fetchStatus();
      } catch (err) {
        outputEl.textContent = 'Error: ' + err.message;
      } finally {
        btn.disabled = false;
      }
    }

    async function submitImport() {
      const label = document.getElementById('import-label').value.trim() || 'seeded';
      const content = document.getElementById('import-content').value;
      const feedback = document.getElementById('import-feedback');

      if (!content) {
        feedback.innerHTML = '<span style="color: var(--danger)">El contenido está vacío.</span>';
        return;
      }

      feedback.innerHTML = '<span style="color: var(--accent)">Procesando y encriptando claves...</span>';

      try {
        const res = await fetch('/admin/seed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ markdown: content, label: label })
        });
        const data = await res.json();
        if (data.success) {
          feedback.innerHTML = '<span style="color: var(--success)">✅ ¡' + data.keysIngested + ' claves encriptadas e ingresadas con éxito!</span>';
          document.getElementById('import-content').value = '';
          fetchStatus();
        } else {
          feedback.innerHTML = '<span style="color: var(--danger)">Error al procesar claves.</span>';
        }
      } catch (err) {
        feedback.innerHTML = '<span style="color: var(--danger)">Error de conexión: ' + err.message + '</span>';
      }
    }

    async function resetAllCooldowns() {
      if (!confirm('¿Restablecer el cooldown de todas las claves ahora?')) return;
      try {
        await fetch('/api/reset-cooldown', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        fetchStatus();
        alert('Cooldowns restablecidos.');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }

    checkAuth();
    setInterval(fetchStatus, 15000);
  </script>
</body>
</html>`;
}
