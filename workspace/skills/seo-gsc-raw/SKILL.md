---
name: seo-gsc-raw
description: Consulta directa a los endpoints GSC (summary/queries/pages) y devuelve JSON limpio para análisis.
---

# SEO GSC Raw

## Objetivo
Obtener datos limpios de GSC desde el backend local.

## Reglas
- Responde en español.
- No publiques nada.
- Devuelve el JSON y un resumen breve.
- Usa `workspace/seo-gsc.js`.

## Flujo
1) Ejecuta uno de estos comandos:
   - `node ../../seo-gsc.js --endpoint summary`
   - `node ../../seo-gsc.js --endpoint queries`
   - `node ../../seo-gsc.js --endpoint pages`
2) Si necesitas dominio específico: `--siteUrl sc-domain:edtools.co`.
3) Responde con:
   - Resumen corto
   - JSON relevante (sin alterar)

## Variables requeridas
- `OPENCLAW_SEO_API_KEY`
- `OPENCLAW_SEO_API_BASE` (opcional)
- `OPENCLAW_GSC_SITE_URL` (opcional)

