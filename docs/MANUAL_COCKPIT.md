# 🏛️ Manual de Usuario: Cockpit Soberano de Telemetría, Límites y LLMOps (v1.0)

Bienvenido al manual operativo del **Cockpit Soberano de Telemetría y Límites** para el ecosistema Zerops y AstroBranding. Este motor fue diseñado bajo una premisa no negociable: **cero consumo de memoria RAM en reposo (0 MB idle)**, garantizando que el agente y el operador puedan supervisar y controlar todos los recursos, cuotas y gastos sin ralentizar el servidor.

---

## 1. Modos de Uso y Acceso

El Cockpit ofrece dos canales de operación complementarios:

1. **Modo Conversacional / CLI Efímero (`cockpit-status`)**: 
   - Ejecución instantánea en menos de 100 milisegundos.
   - Emite el reporte consolidado en la terminal o al chat de Antigravity (AGY) y finaliza de inmediato liberando el 100% de la memoria RAM.
2. **Modo Dashboard Web Visual (`cockpit-web`)**:
   - Micro-servidor HTTP en Bun en el puerto `3050`.
   - Interfaz gráfica moderna con Tailwind CSS en Dark Mode nativo.
   - Consumo de ~12 a 15 MB de RAM **únicamente mientras esté encendido**.
   - Incluye temporizador de **auto-apagado por inactividad tras 30 minutos** para evitar fugas de memoria si se olvida la pestaña abierta.

---

## 2. Interacción en Lenguaje Natural (Chat AGY)

No necesitas recordar comandos técnicos de consola. Puedes solicitarle al asistente Antigravity (AGY) directamente en lenguaje cotidiano:

| Solicitud en Lenguaje Natural | Acción Ejecutada por el Agente |
|---|---|
| *"¿Cómo está el cockpit?"* / *"Dame el estado general del sistema"* | Ejecuta `cockpit-status` y presenta el resumen ejecutivo. |
| *"¿Cuánto hemos gastado en DeepSeek o en Bifrost?"* | Filtra las métricas de gasto en USD y consumo de tokens. |
| *"¿Cómo va el semantic cache de Bifrost?"* | Reporta la tasa de acierto (hit ratio) y el ahorro en costo y latencia. |
| *"¿Cuáles proveedores de FreeLLMAPI están listos o en cooldown?"* | Inspecciona la latencia y llaves activas en el pool gratuito. |
| *"¿Cómo está la memoria de Valkey y el espacio en disco?"* | Consulta la telemetría de infraestructura Zerops y `/mnt/localstorage`. |
| *"Enciende el dashboard web"* / *"Quiero ver el panel visual"* | Ejecuta `cockpit-web start` y provee la URL local/túnel. |
| *"Apaga el panel web"* | Ejecuta `cockpit-web stop` para liberar la memoria de inmediato. |

---

## 3. Uso por Terminal (Línea de Comandos CLI)

Si prefieres operar directamente desde la consola del contenedor `zcp`:

```bash
# 1. Reporte completo con formato visual enriquecido (colores ANSI y tablas)
cockpit-status

# 2. Salida en formato JSON estructurado (ideal para automatizaciones o scripts)
cockpit-status --json

# 3. Reporte enfocado exclusivamente en LLMOps (Bifrost Gateway y FreeLLMAPI)
cockpit-status --llm

# 4. Reporte enfocado exclusivamente en Infraestructura Zerops (Runtimes, Valkey, Discos)
cockpit-status --infra

# 5. Reporte enfocado en APIs Externas y Astrológicas (glamur-keys.md)
cockpit-status --apis
```

---

## 4. Uso del Dashboard Web On-Demand

Para encender y apagar la interfaz gráfica visual:

```bash
# Iniciar el servidor web (puerto 3050 por defecto)
cockpit-web start

# Verificar si el servidor web está corriendo y cuánta memoria usa
cockpit-web status

# Detener el servidor web y volver a 0 MB de memoria RAM en reposo
cockpit-web stop

# Reiniciar el servidor web
cockpit-web restart
```

### Componentes de la Interfaz Web
- **Tarjetas de KPI Superiores**:
  - Gasto acumulado en USD en proveedores comerciales.
  - Tasa de acierto de Semantic Cache (hits y porcentaje de llamadas resueltas en 0ms).
  - Estado y latencia de FreeLLMAPI.
  - Ocupación en disco de `localstorage` y cuota de `objectstorage`.
- **Matriz de Virtual-Keys & Presupuestos**:
  - Lista de claves virtuales activas (`Production Sovereign Key`, `AstroBranding Production`, `Hermes Agent Autonomous`, `Evolution WhatsApp Bot`, `Antigravity AGY Operator`).
  - Total de solicitudes procesadas, tokens de entrada/salida y costo consumido vs. límite mensual.
  - Semáforo de estado: `OK` (verde), `WARNING` (amarillo, >80% del presupuesto), `EXCEEDED` (rojo).
- **Malla de Runtimes Zerops**:
  - Monitor en vivo de cada contenedor del proyecto (`bifrost`, `freellmapi`, `valkey`, `zcp`, `localstorage`, `objectstorage`, `astrobranding`, `hermes`, `database`, `nats`).
- **Catálogo de APIs Externas y Astrológicas**:
  - Validación del estado de configuración de Exa, Tavily, Firecrawl, Jina, Brave, Astroway, FreeAstroAPI, VedAstro, Kundali, NASA JPL Horizons, ZeptoMail y Cloudflare.
  - Claves enmascaradas para garantizar cero filtración de secretos.

---

## 5. Interpretación de Métricas Críticas

### 5.1 Semantic Cache de Bifrost
- **Funcionamiento**: El vector store embebido `chromem` almacena los embeddings de las consultas en `/app/data/chromem`.
- **Lectura**: Cuando una consulta se repite semánticamente, Bifrost responde en menos de 1 milisegundo y con **$0.00 USD de costo**.
- **Meta operativa**: Mantener una tasa de acierto superior al 25% en producción para optimizar costos de inferencia.

### 5.2 Cuotas y Cooldowns en FreeLLMAPI
- **Funcionamiento**: Agrega múltiples cuentas gratuitas de proveedores (Groq, Cerebras, Cohere, Mistral, Gemini, etc.).
- **Prioridad**: Bifrost enruta primero al pool gratuito (`priority: 1`). Solo si los límites de los proveedores gratuitos se saturan, conmuta transparentemente a DeepSeek comercial (`priority: 0`).

### 5.3 Almacenamiento Local (`localstorage`)
- Montado en `/var/www/localstorage`.
- Contiene la base de datos persistente de FreeLLMAPI (`freellmapi.db`) y los datos de Bifrost.
- El cockpit alerta si el disco supera el 85% de capacidad.

---

## 6. Sincronización y Mantenimiento SSoT

- El script aprovisionador [`0zcp-123/scripts/setup-zcp.sh`](file:///var/www/baiosfera/0ZEROPS-AGY/0zcp-123/scripts/setup-zcp.sh) contiene la configuración determinista para registrar `cockpit-status` y `cockpit-web` como binarios globales en `/usr/local/bin/`.
- Al clonar este proyecto en un nuevo contenedor Zerops limpio, la ejecución de [`unisetup.sh`](file:///var/www/baiosfera/0ZEROPS-AGY/0zcp-123/scripts/unisetup.sh) restablece automáticamente todo el entorno sin requerir intervención manual.
