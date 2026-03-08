---
name: ghost-content
description: Creates Ghost content from keywords and drafts posts automatically using the local Ghost admin API script. Use when the user asks to write Ghost posts, create content from keywords, or publish to Ghost.
---

# Ghost Content (Draft Auto-Create)

## Objetivo
Crear contenido en Ghost a partir de palabras clave y **dejarlo en draft automáticamente** usando `ghost/ghost-post.js`.

## Reglas
- Responde siempre en español.
- Genera HTML listo para Ghost (no Markdown).
- Publica como **draft** por defecto.
- No pidas confirmación para crear draft; ejecuta la publicación.
- Solo publica como `published` si el usuario lo pide explícitamente.
- Genera **meta title**, **meta description** y **excerpt** en cada post.
- Canonical: **vacío** (usa la URL del post actual).
- **Nunca uses UUID de URL pública como ID**. Para editar, usa `--update-title` (ID interno real).
- Evita prometer pasos; ejecuta directamente y devuelve resultado.
- No uses Browser Relay ni pidas Chrome; publica vía API con `ghost-post.js`.
- Si la ejecución falla, reporta el error y no confirmes publicación.

## Flujo
1) Resume el pedido en 1 línea (keywords, tono, longitud).
2) Genera el contenido en HTML.
3) Guarda el HTML en un archivo temporal en el workspace:
   - `printf "%s" "<HTML>" > ghost-draft.html`
4) Ejecuta el script:
   - **Si es un draft nuevo**: `node ../../ghost-post.js --title "<titulo>" --status draft --tags "tag1,tag2" --html-file ./ghost-draft.html --meta-title "<meta>" --meta-description "<meta_desc>" --excerpt "<excerpt>"`
   - **Si es una edición de draft existente**: `node ../../ghost-post.js --update-title "<titulo>" --title "<titulo>" --status draft --tags "tag1,tag2" --html-file ./ghost-draft.html --meta-title "<meta>" --meta-description "<meta_desc>" --excerpt "<excerpt>"`
4) Devuelve el link o id del post y ofrece ajustes.

## Variables requeridas (ya en el server)
- `GHOST_API_URL`
- `GHOST_ADMIN_API_KEY`
- `GHOST_CONTENT_API_KEY` (opcional para lectura)

## Ejemplo
**Input**: "keywords: IA educativa, edtech, colegios; tono profesional; 800 palabras"

**Salida**:
- Draft creado en Ghost (link/id)
- Resumen breve y opciones de edición
