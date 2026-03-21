# TOOLS-CLI.md

Este documento define el contrato CLI de las tools canónicas de OpenClaw.

## Convención única de ejecución

```bash
cd /data/workspace
node ./<script>.js [flags]
```

## Scripts canónicos

- `serper-search.js`
- `seo-gsc.js`
- `ghost-post.js`
- `ghost-analysis.js`

## Contrato por tool

### `serper-search.js`

Uso:

```bash
node ./serper-search.js --type search --query "tu consulta" --num 6 --country co --language es
```

Flags:
- `--query`, `-q` (requerido)
- `--type` (`search`|`news`, default `search`)
- `--num` (1-20, default `5`)
- `--country` (default `us`)
- `--language` (default `en`)
- `--help` (muestra ayuda)

Env requerida:
- `SERPER_API_KEY`

Salida esperada:
- `stdout`: JSON con `ok`, `type`, `query`, `country`, `language`, `results[]`
- `stderr`: errores prefijados con `Error:`

### `seo-gsc.js`

Uso:

```bash
node ./seo-gsc.js --endpoint summary --compare previous
```

Flags:
- `--endpoint` (`summary`|`queries`|`pages`, default `summary`)
- `--dimensions` (si se envía, usa endpoint `explore`)
- `--days`, `--startDate`, `--endDate`, `--compare`
- `--rowLimit`, `--startRow`
- `--searchType`
- `--filterDimension`, `--filterOperator`, `--filterExpression`
- `--siteUrl`, `--api-base`, `--api-key`
- `--includeInsights` (`true`|`false`)
- `--help` (muestra ayuda)

Env requerida:
- `OPENCLAW_SEO_API_KEY`

Env opcional:
- `OPENCLAW_SEO_API_BASE` (default `http://localhost:8080`)
- `OPENCLAW_GSC_SITE_URL`

Salida esperada:
- `stdout`: JSON retornado por `/api/seo/gsc/*`
- `stderr`: errores prefijados con `Error:`

### `ghost-post.js`

Uso (crear draft):

```bash
node ./ghost-post.js --title "Titulo" --status draft --tags "tag1,tag2" --html-file ./ghost-draft.html
```

Uso (editar draft):

```bash
node ./ghost-post.js --update-title "Titulo existente" --title "Titulo" --status draft --html-file ./ghost-draft.html
```

Flags:
- `--title` (requerido)
- `--html`, `--html-file`
- `--status` (`draft`|`published`, default `draft`)
- `--tags`, `--excerpt`, `--slug`, `--feature-image`
- `--meta-title`, `--meta-description`, `--canonical`
- `--id`, `--update-title`, `--update-latest`
- `--help` (muestra ayuda)

Env requerida:
- `GHOST_API_URL`
- `GHOST_ADMIN_API_KEY`

Salida esperada:
- `stdout`: URL o ID del post
- `stderr`: logs operativos `[ghost-post] ...` y errores con `Error:`

### `ghost-analysis.js`

Uso:

```bash
node ./ghost-analysis.js --limit 100
```

Flags:
- `--api-url`
- `--content-key`
- `--limit` (default `100`)
- `--help` (muestra ayuda)

Env requerida:
- `GHOST_API_URL`
- `GHOST_CONTENT_API_KEY`

Salida esperada:
- `stdout`: JSON con `total`, `posts[]`, `topKeywords[]`, `topTags[]`
- `stderr`: errores con `Error:`

## Estandar minimo de observabilidad

- Todos los scripts deben soportar `--help`.
- Éxito por `stdout` con formato estable (texto o JSON según tool).
- Errores siempre por `stderr`, prefijo `Error:`, y `exit 1`.
- Logs diagnósticos permitidos en `stderr` con prefijo de tool (`[ghost-post]`, `[seo-gsc]`, etc.).

## Nota de compatibilidad

Los scripts en `workspace/research/`, `workspace/ghost/` y `.openclaw/workspace-research/` se consideran copias legacy de compatibilidad. No son la fuente de verdad.
