# Railway Runbook: Subagents + Cron

## Objetivo

Verificar en produccion Railway que:

- `/subagents spawn` funciona desde Telegram sin error `1008: pairing required`
- los cron jobs corren con fallback estable (`main + systemEvent`)

## Precondiciones

- Variables Railway:
  - `OPENCLAW_STATE_DIR=/data/.openclaw`
  - `OPENCLAW_WORKSPACE_DIR=/data/workspace`
  - `OPENCLAW_SETUP_ALLOW_INSECURE_CONTROL_UI_AUTH=true`
- Volumen montado en `/data`
- Deploy con esta version del template

## Paso 1: Setup y seguridad operativa

1. Abrir `/setup`.
2. Ejecutar `Run setup`.
3. En Device Pairing Helper:
   - `Refresh pending devices`
   - aprobar requestIds pendientes
4. En Debug Console:
   - `openclaw.status`
   - `openclaw.health`

Resultado esperado:
- gateway reachable
- sin cierre 1008 en chat

## Paso 2: Verificar subagents en Telegram

Desde Telegram:

1. `/subagents list`
2. `/subagents spawn --thinking low`
3. Enviar una tarea corta al subagent (por ejemplo: "resume este mensaje en 3 bullets")
4. `/subagents info <id>`

Resultado esperado:
- spawn devuelve run id
- subagent finaliza
- llega anuncio de finalizacion al chat

## Paso 3: Verificar cron jobs

En Debug Console:

1. `openclaw.config.get cron.enabled`
2. `openclaw.status`
3. revisar que exista `/data/.openclaw/cron/jobs.json` (via Config Editor o debug)

Ejecucion manual de prueba (si CLI disponible en terminal):

1. `openclaw cron list`
2. `openclaw cron run <job-id>`
3. `openclaw cron runs --id <job-id>`

Resultado esperado:
- job encolado/ejecutado
- salida en runs
- entrega a Telegram (announce)

## Paso 4: No regresion

Checklist:

- Telegram responde comandos normales
- `/subagents spawn` ya no falla con 1008
- cron jobs generan ejecuciones
- `memory/` persiste entre reinicios
- flujo Ghost/SEO sigue operativo

## Rollback rapido

Si necesitas volver al estado anterior de cron:

1. Restaurar `.openclaw/cron/jobs.json` desde backup
2. Redeploy
3. Verificar con `openclaw cron list`
