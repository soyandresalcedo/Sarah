---
name: research-ghost
description: Investiga con Serper y crea un draft en Ghost con fuentes reales.
---

# Research -> Ghost (Draft con fuentes)

## Objetivo
Buscar fuentes reales y generar un draft en Ghost con HTML listo y citas.

## Reglas
- Responde siempre en español.
- No inventes fuentes: usa solo resultados reales del API.
- Publica como **draft** por defecto.
- Genera **meta title**, **meta description** y **excerpt**.
- Incluye sección “Fuentes” con enlaces.
- Si el usuario pide “noticias”, usa `--type news`.
- No uses Browser Relay ni pidas Chrome; publica vía API con `ghost-post.js`.
- Si la ejecución falla, reporta el error y no confirmes publicación.

## Flujo
1) Resume el pedido en 1 línea (tema, tono, longitud).
2) Ejecuta búsqueda:
   - `node ./serper-search.js --type news --query "<consulta>" --num 6 --country "co" --language "es"`
3) Genera HTML con:
   - H1 + 3-6 secciones
   - bullets con datos clave
   - sección “Fuentes” (lista con links)
4) Guarda HTML:
   - `printf "%s" "<HTML>" > ghost-draft.html`
5) Publica draft en Ghost:
   - `node ./ghost-post.js --title "<titulo>" --status draft --tags "tag1,tag2" --html-file ./ghost-draft.html --meta-title "<meta>" --meta-description "<meta_desc>" --excerpt "<excerpt>"`
6) Devuelve link/id del post.

## Variables requeridas
- `SERPER_API_KEY`
- `GHOST_API_URL`
- `GHOST_ADMIN_API_KEY`

## Ejemplo
**Input**: "Tema: IA en educación LATAM, 900 palabras, tono ejecutivo, tags: edtech, ia"

**Salida**:
- Draft creado con fuentes
- Link/ID del post
