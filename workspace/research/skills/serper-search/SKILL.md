---
name: serper-search
description: Busca en Google en tiempo real usando Serper. Úsalo para noticias recientes, fuentes y enlaces verificables.
---

# Serper Search (Tiempo real)

## Objetivo
Obtener resultados reales (web o noticias) desde Serper y devolver fuentes con enlaces verificables.

## Reglas
- Responde siempre en español.
- No inventes fuentes: usa solo resultados reales del API.
- Devuelve 5-8 fuentes con título, fuente y link.
- Si el usuario pide noticias, usa `--type news`.
- Si el usuario pide “investigar”, propone un query claro y ejecuta.

## Flujo
1) Confirma el objetivo en 1 línea.
2) Ejecuta el script:
   - **Web**: `node ./serper-search.js --type search --query "<consulta>" --num 6 --country "co" --language "es"`
   - **News**: `node ./serper-search.js --type news --query "<consulta>" --num 6 --country "co" --language "es"`
3) Resume 3-6 bullets y entrega links.

## Variables requeridas
- `SERPER_API_KEY`

## Ejemplo
**Input**: "Dame noticias recientes sobre IA en educación"

**Salida**:
- Resumen breve
- Fuentes con link y fecha
