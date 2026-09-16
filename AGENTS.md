# 🏛️ Directivas Operativas para Agentes Antigravity (AGY)

Este repositorio es una **plantilla de monorepo soberano, agnóstico y multi-ZCP** optimizada para la plataforma **Zerops (Incus LXC runtimes)**. Sintetiza la arquitectura de contratos estrictos, Transactional Outbox y guardián de capas de `di-sukharev/vibe`, con el modelo de mismo origen en puerto 3000 de `xanthous-tech/hono-astro-remix-template` (Astro 5 SSR + islas React 19 + API Hono en Bun nativo).

---

## 🛑 Principio Arquitectónico Fundacional (Anti-AMN)

1. **Este contenedor es el Plano de Control (`zcp`)**:
   - Este entorno es **únicamente** la consola de orquestación y administración de Zerops (`zcp@1`).
   - **Acá NO corre la aplicación ni sus bases de datos.**
   - No intentes levantar servidores de desarrollo (`bun run dev`) ni ejecutar builds pesados en este contenedor.
2. **Los Runtimes Viven en Zerops (Incus LXC)**:
   - La aplicación y sus dependencias se despliegan en una malla soberana de **10 servicios independientes** aprovisionados mediante [`import.yaml`](file:///var/www/zerops-astrobranding/import.yaml).
   - El servicio principal (`astrobranding`) corre en su propio contenedor Incus LXC nativo (**`ubuntu/bun@1.3.9`** en el puerto `:3000`).
   - Las compilaciones de producción (`bun install`, `bun run build`) las ejecuta el pipeline nativo de Zerops declarado en [`zerops.yaml`](file:///var/www/zerops-astrobranding/zerops.yaml), **nunca** el agente en el host de control.
3. **Herramientas Nativas de Plataforma**:
   - Para interactuar con Zerops, usá exclusivamente los tools MCP de Zerops (`zerops_workflow`, `zerops_import`, `zerops_discover`, `zerops_events`, `zerops_logs`, `zerops_verify`, `zerops_delete`).
   - Jamás uses `zcli` dentro de este contenedor ni intentes instalarlo: el contenedor `zcp` ya está enlazado a la API nativa de la plataforma.

---

## 🚀 Protocolo de Inicialización y Despliegue en un ZCP Limpio

Cuando un operador humano o un agente AGY abra este repositorio en un contenedor ZCP nuevo (incluso con memoria Engram vacía), debe seguir estrictamente este flujo secuencial y determinista:

### 1. Pre-vuelo y Verificación de Entorno
Ejecutar la compuerta de sanidad del plano de control:
```bash
./setup.sh --step 1
```
- Verifica la presencia física de `.env` (creándolo desde `.env.example` si falta).
- Comprueba que el entorno base de Node esté disponible para los scripts de utilidad.

### 2. Ingesta de Credenciales y Quota Stacking (FreeLLMAPI)
Ingestar las claves API sin hardcodearlas en el código ni exponerlas en git:
```bash
./setup.sh --step 2 /ruta/a/credenciales1.md /ruta/a/credenciales2.md
```
- Acepta uno o más archivos Markdown de cuentas (por ejemplo, doble free-tier de Google AI Studio, Groq, Cerebras, OpenRouter).
- Extrae y balancea las claves en [`apps/freellmapi/data/seed.json`](file:///var/www/zerops-astrobranding/apps/freellmapi/data/seed.json) para alimentar la base SQLite persistente cuando FreeLLMAPI se despliegue.

### 3. Validación de Topología y Fronteras Arquitectónicas
Auditar los contratos antes de tocar la plataforma:
```bash
./setup.sh --step 3
```
- Ejecuta `zcp-validate yaml import.yaml` para asegurar que la sintaxis y perfiles de los 10 servicios cumplen con la especificación de Zerops.
- Ejecuta [`scripts/architecture-check.mjs`](file:///var/www/zerops-astrobranding/scripts/architecture-check.mjs) para auditar que no haya violaciones entre capas de dominio (`apps` y `packages/contracts`).

### 4. Aprovisionamiento de la Malla en Zerops
Aprovisionar los 10 servicios en la nube de Zerops mediante el MCP nativo:
1. Iniciar workflow de bootstrap en Zerops:
   ```json
   zerops_workflow action="start" workflow="bootstrap" route="classic" intent="Aprovisionar plantilla monorepo astrobranding"
   ```
2. Importar el manifiesto de infraestructura:
   ```json
   zerops_import filePath="import.yaml"
   ```
3. Zerops aprovisiona la infraestructura en cascada estricta por prioridades:
   - **Prioridad 10 (Datos y Colas):** `database` (PostgreSQL 18), `valkey` (Valkey 7.2), `nats` (NATS 2.12), `objectstorage` (S3) y `localstorage` (volumen POSIX).
   - **Prioridad 8 (Inferencia Upstream):** `freellmapi` (Node.js 24 + SQLite).
   - **Prioridad 6 (Gateways):** `bifrost` (Go v2.0.0, AI Gateway en `:8080`) y `evolution` (Go WhatsApp Engine en `:8085`).
   - **Prioridad 4 (Agente Autónomo):** `hermes` (Python 3.12 en Ubuntu).
   - **Prioridad 2 (Webapp Fullstack):** `astrobranding` (Bun 1.3.9 en `:3000`).

### 5. Adopción y Montajes Automáticos
Una vez creados los servicios, ZCP adopta los runtimes y monta el código en `/var/www/<hostname>/`:
```json
zerops_workflow action="start" workflow="bootstrap" route="adopt"
zerops_workflow action="complete" step="discover" scope=["astrobranding", "bifrost", "evolution", "freellmapi", "hermes"]
zerops_workflow action="complete" step="provision" attestation="Servicios verificados y montados"
```

---

## 🏛️ Invariantes Técnicos del Monorepo

- **Agnosticismo Total**: Prohibido hardcodear rutas absolutas de usuarios específicos (como `/var/www/baiosfera/`), correos de cuentas o claves fijas. Todo debe operar con variables de entorno o archivos pasados por parámetro.
- **SSoT en `packages/contracts`**: Los tipos y validadores residen en Zod 4 dentro de `packages/contracts`. Ni el frontend ni el backend inventan esquemas duplicados.
- **Patrón Transactional Outbox**: Las operaciones críticas de negocio se registran en la tabla `task_outbox` de PostgreSQL 18 con UUIDv7 nativo antes de emitir eventos hacia NATS JetStream o BullMQ.
- **Bifrost como Front Door de IA**: Todo el tráfico LLM pasa por `http://bifrost:8080/v1` con enrutamiento declarativo CEL y caché semántica en Valkey 7.2.
- **Mismo Origen Web**: La landing comercial, el gabinete del consultante (`/app`), el panel del coach (`/desk`) y las rutas `/api` conviven bajo el mismo origen en el puerto 3000 de `apps/astrobranding`.
