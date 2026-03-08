---
name: ghost-analysis
description: Analyzes Ghost published posts using the Content API, summarizes titles/tags/dates, extracts keyword patterns, and proposes new topics. Use when the user asks for Ghost content analysis or strategy.
---

# Ghost Analysis

## Objetivo
Analizar posts publicados en Ghost usando la Content API y proponer temas nuevos.

## Reglas
- Responde en español.
- No publiques nada.
- Usa `ghost/ghost-analysis.js` para obtener datos.

## Flujo
1) Ejecuta:
   - `node ../../ghost-analysis.js`
   - Si falta env, usa:
     `node ../../ghost-analysis.js --api-url "https://TU_URL" --content-key "TU_KEY"`
2) Resume:
   - listado de títulos, tags y fechas (puedes resumir si son muchos)
   - keywords dominantes (top 10)
   - patrones detectados
3) Propón 5 temas nuevos con enfoque y ángulo claro.

## Variables requeridas (ya en el server)
- `GHOST_API_URL`
- `GHOST_CONTENT_API_KEY`
