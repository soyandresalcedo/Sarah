---
name: seo-intelligence-weekly
description: Genera insights semanales de GSC (posiciones 8–20, CTR bajo, caídas) y propone 3 acciones prioritarias. Úsalo cuando pidan insights SEO desde Telegram/OpenClaw.
---

# SEO Intelligence Weekly

## Objetivo
Consumir el backend GSC y entregar 3 acciones de alto impacto esta semana.

## Reglas
- Responde en español.
- No publiques nada automáticamente.
- Usa `workspace/seo-gsc.js` para obtener los datos.
- Prioriza acciones con impacto potencial (impresiones altas, posiciones 8–20).

## Flujo
1) Ejecuta:
   - `node ../../seo-gsc.js --endpoint summary --compare previous`
   - Si necesitas dominio específico: `--siteUrl sc-domain:edtools.co`
2) Usa `insights.lowCtrHighImpressions` y `insights.positions8to20`.
3) Entrega 3 acciones concretas:
   - Nuevo artículo
   - Update de artículo existente
   - Mejora de title/H1
4) Si hay `compare`, menciona subidas o caídas relevantes.

## Variables requeridas
- `OPENCLAW_SEO_API_KEY`
- `OPENCLAW_SEO_API_BASE` (opcional)
- `OPENCLAW_GSC_SITE_URL` (opcional)

