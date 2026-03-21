# TOOLS.md - OpenClaw Tools (Canónico)

## Scripts canónicos

La fuente de verdad de tools ejecutables está en `workspace/`:

- `workspace/serper-search.js`
- `workspace/seo-gsc.js`
- `workspace/ghost-post.js`
- `workspace/ghost-analysis.js`

Convención recomendada en skills y jobs:

```bash
cd /data/workspace
node ./<script>.js [flags]
```

## Copias legacy (no canónicas)

Existen copias en:

- `workspace/research/*.js`
- `workspace/ghost/*.js`
- `.openclaw/workspace-research/*.js`

Estas copias se consideran **compatibilidad/seed**. No deben usarse para cambios nuevos ni como referencia principal.

## Documentación técnica

Contrato CLI unificado: `workspace/TOOLS-CLI.md`.
