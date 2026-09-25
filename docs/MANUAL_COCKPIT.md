# 🏛️ Manual de Usuario: Cockpit Soberano de Telemetría, Límites y LLMOps (v2.0)

Bienvenido al manual operativo del **Cockpit Soberano de Telemetría y Límites** para el ecosistema Zerops y AstroBranding. Este motor fue diseñado bajo una premisa no negociable: **cero consumo de memoria RAM en reposo (0 MB idle)**, garantizando que el operador y el agente puedan supervisar recursos físicos, cuotas de búsqueda, balances de APIs y gastos de inferencia sin ralentizar el servidor.

---

## 1. Modos de Uso y Acceso

El Cockpit ofrece dos canales de operación complementarios:

1. **Modo Conversacional / CLI Efímero (`cockpit-status`)**: 
   - Ejecución instantánea en sub-segundo (~500ms).
   - Emite el reporte consolidado en la terminal o al chat de Antigravity (AGY) y finaliza de inmediato liberando el 100% de la memoria RAM.
2. **Modo Dashboard Web Visual (`cockpit-web`)**:
   - Micro-servidor HTTP en Bun en el puerto `3050`, expuesto de forma segura por el proxy reverso Nginx en el puerto `8080`.
   - **URL de Acceso Global**: `https://zcp-252-8080.ny1.zerops.app/cockpit/`
   - Interfaz gráfica moderna con Tailwind CSS en Dark Mode nativo.
   - Consumo de ~12 a 15 MB de RAM **únicamente mientras esté encendido**.
   - Incluye temporizador de **auto-apagado por inactividad tras 30 minutos** para garantizar que no se deje RAM consumida por descuido.
   - Botón directo de apagado en la interfaz que libera la memoria al instante.

---

## 2. Las 5 Categorías Estrictas de Telemetría

El Cockpit categoriza rigurosamente todos los componentes para evitar reportes genéricos ("ACTIVE") y presentar métricas reales, cuotas y límites:

### 🤖 [1/5] LLMOps & Gateway de Inferencia (Bifrost & FreeLLMAPI)
- **Bifrost Core**:
  - Gasto real en USD por Virtual-Key vs. presupuesto mensual asignado (`$0.0004 / $25.00`, etc.).
  - Peticiones procesadas y tokens totales (entrada/salida).
  - Tasa de acierto de **Semantic Cache** (`chromem`) y peticiones resueltas con latencia 0ms y costo $0.00.
  - Límites de frecuencia aplicados por CEL (`rateLimitRpm`).
- **FreeLLMAPI Pool**:
  - Latencia en milisegundos hacia el pool gratuito.
  - Estado de la caché de respuestas en SQLite (`ACTIVE`).
  - Proveedores con claves listas y operativas (`deepseek`, `groq`, etc.).
- **Arquitectura de Persistencia Indestructible**:
  - Bifrost persiste su historial transaccional en SQLite (`/app/data/logs.db`) y sus embeddings semánticos en disco (`/app/data/chromem/*.gob.gz`).
  - Los contadores de Prometheus en RAM se reinician a 0 si el contenedor se reinicia, pero `cockpit-status` consulta directamente la base de datos física para reportar siempre los totales acumulados reales sin pérdida histórica.

### ☁️ [2/5] Infraestructura Zerops & Recursos Físicos
- **Consumo Real de RAM por Contenedor (cgroup v2 / Prometheus)**:
  - `zcp`: Memoria activa real en MB (Control Plane).
  - `freellmapi`: Memoria activa en MB (Node.js 24).
  - `bifrost`: Memoria activa en MB (Go 1.22).
  - `valkey`: Memoria residente en MB y tiempo de CPU.
  - `localstorage`: Memoria activa en MB.
  - Contenedores detenidos (`astrobranding`, `hermes`, `evolution`, `database`, `nats`): marcados explícitamente en `0 MB ($0.00 de costo)`.
- **Almacenamiento Local (POSIX)**:
  - Ocupación en `/var/www/localstorage` desglosada por servicio (`bifrostSize`, `freellmSize`, `totalUsed`).
- **Object Storage S3**:
  - Cuota asignada (50 GB) y estado del bucket (`glamur-assets`).

### 🌐 [3/5] Browsers, Scraping & Motores de Búsqueda (Cuotas & Saldos)
Inspección en vivo mediante consultas autenticadas y lectura de cabeceras oficiales:
- **Tavily Search API**: Búsquedas consumidas vs. límite mensual (ej: `768 / 1,000 usadas`, `232 restantes`, `77% consumido`).
- **Firecrawl Scraper**: Créditos consumidos vs. cuota (ej: `2 / 1,000 créditos usados`, `998 restantes`).
- **Exa Neural Search**: Consultas estimadas y costo por query ($0.007/query en plan de $10 USD).
- **Jina AI Reader / Embeddings**: Límite de frecuencia (500 RPM) y cuota de tokens.
- **Brave Search API**: Límite por segundo (50 RPS) y cuota mensual gratuita (2,000 queries/mes).
- Todas las claves se muestran enmascaradas (`tvly-d...pqvv`) para certificar su configuración sin exponer secretos.

### 🔮 [4/5] APIs Astrológicas & Efemérides Científicas
- **NASA JPL Horizons**: Peticiones restantes (`9,999 / 10,000`) y rate limit (1,000 req/hora).
- **Astroway Engine**: 760 endpoints / Swiss Ephemeris D1-D60 y rate limit (60 RPM).
- **FreeAstro API**: Límite diario (500 consultas/día) y rate limit (10 RPS).
- **VedAstro Jyotish**: 677 calculadores atómicos védicos y rate limit (60 RPM).
- **Kundali MCP Engine**: Motor de cálculo local e ilimitado (Shadbala, Vimshottari, BPHS).
- **AstrologyAPI.io**: Timing helenístico, Fagan-Bradley, ACG y rate limit (30 RPM).

### 📨 [5/5] Mensajería, Edge & CDN Transaccional
- **Zoho ZeptoMail**: Capacidad transaccional (10,000 emails de bienvenida) y entrega SMTP/REST.
- **Meta WhatsApp Cloud**: 1,000 conversaciones de servicio mensuales gratuitas (API Graph v21+).
- **Cloudflare Edge DNS/CDN**: SSL Full Strict, Edge WAF y sincronización de DNS sin límite.

---

## 3. Interacción en Lenguaje Natural (Chat AGY)

No necesitas recordar comandos técnicos de consola. Puedes solicitarle a Antigravity (AGY) directamente:

| Solicitud en Lenguaje Natural | Acción Ejecutada por el Agente |
|---|---|
| *"¿Cómo está el cockpit?"* / *"Dame el estado general del sistema"* | Ejecuta `cockpit-status` y presenta el reporte estructurado de las 5 categorías. |
| *"¿Cuánto saldo me queda en Tavily o Firecrawl?"* | Inspecciona las cuotas de búsqueda y muestra consumido vs. restante. |
| *"¿Cuánto hemos gastado en inferencia LLM?"* | Filtra el gasto en USD y consumo de tokens en Bifrost. |
| *"¿Cómo va el semantic cache de Bifrost?"* | Reporta la tasa de acierto (hit ratio) y el ahorro en tokens. |
| *"¿Cuánta memoria RAM física están consumiendo los contenedores?"* | Muestra el consumo exacto en MB por cgroup v2. |
| *"Enciende el dashboard web"* / *"Quiero ver el panel visual"* | Ejecuta `cockpit-web start` y provee la URL del panel. |
| *"Apaga el panel web"* | Ejecuta `cockpit-web stop` para volver a 0 MB de memoria RAM. |

---

## 4. Comandos de Terminal (Línea de Comandos CLI)

```bash
# 1. Reporte completo estructurado en 5 categorías
cockpit-status

# 2. Salida en formato JSON estructurado
cockpit-status --json

# 3. Filtro exclusivo por categoría
cockpit-status --llm         # Solo LLMOps (Bifrost & FreeLLM)
cockpit-status --infra       # Solo Contenedores Zerops, RAM real y discos
cockpit-status --browsers    # Solo Cuotas de Búsqueda y Scraping (Tavily, Firecrawl, Exa)
cockpit-status --astrology   # Solo APIs Astrológicas y Efemérides
cockpit-status --apis        # Solo Mensajería y Edge
```

---

## 5. Control del Servidor Web (`cockpit-web`)

```bash
# Iniciar el servidor web (puerto 3050 -> Nginx 8080)
cockpit-web start

# Verificar si el servidor web está corriendo, puerto y memoria RAM
cockpit-web status

# Detener el servidor web y volver a 0 MB de memoria RAM
cockpit-web stop

# Reiniciar el servidor web tras actualizaciones
cockpit-web restart
```

---

## 6. Sincronización y Mantenimiento SSoT

- **Clonabilidad Garantizada**: Toda la infraestructura del Cockpit está sincronizada en:
  1. [`0zcp-123/scripts/setup-zcp.sh`](file:///var/www/baiosfera/0ZEROPS-AGY/0zcp-123/scripts/setup-zcp.sh): Despliega automáticamente `cockpit-status`, `cockpit-web` y la regla de proxy reverso `/cockpit/` en Nginx.
  2. [`unisetup.sh`](file:///var/www/baiosfera/0ZEROPS-AGY/0zcp-123/scripts/unisetup.sh): Garantiza que cualquier nuevo contenedor ZCP arranque con el Cockpit 100% operativo sin intervención manual.
  3. `docs/MANUAL_COCKPIT.md` y `0zcp-123/scripts/MANUAL_COCKPIT.md`: Espejados de forma idéntica en Google Drive SSoT.
