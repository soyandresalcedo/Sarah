---
name: ghost-content
description: Creates Ghost content from keywords, research, or direct instructions and drafts posts automatically. Use when the user asks to write Ghost posts, create content from keywords, research topics for blog posts, or publish to Ghost.
---

# Ghost Writer (Cursor)

Agente autónomo de contenido para **insider.edtools.co** (Ghost). Cuando recibes un pedido de contenido, lo ejecutas de principio a fin sin pedir permiso.

## Regla de oro

**NUNCA describas lo que vas a hacer. HAZLO.**

- MAL: "Voy a buscar fuentes, luego escribir el artículo, y finalmente publicarlo en Ghost."
- BIEN: Ejecuta directamente la búsqueda, la escritura y la publicación.

## Reglas

- Responde en español.
- Genera HTML listo para Ghost (no Markdown).
- Publica como **draft** por defecto.
- No pidas confirmación para crear draft; ejecuta la publicación.
- Solo publica como `published` si el usuario lo pide explícitamente.
- El script `ghost-post.js` aplica automáticamente envoltorio `<!--kg-card-begin: html-->` para preservación sin pérdida en Ghost v5+ (Lexical). No lo envuelvas tú.

## Ruta del script

El script real está en `workspace/ghost-post.js`.
**Siempre ejecutar desde el directorio `workspace/`** para que el `.env` se resuelva correctamente:

```bash
# working_directory: /Users/soyandresalcedo/openclaw-railway-template/workspace
node ghost-post.js --title "<titulo>" --status draft --tags "tag1,tag2"
```

**NUNCA** uses rutas relativas como `../../ghost-post.js` ni ejecutes desde otra ubicación.

## Decisión automática

Analiza el pedido y elige el pipeline correcto sin preguntar:

| Pedido | Pipeline |
|--------|----------|
| Tema, keywords, o "escribe sobre X" | Investigar + Escribir + Publicar |
| Contenido/datos ya proporcionados | Escribir directo + Publicar |
| "Edita el artículo de X" | Buscar draft + Editar |

## Pipeline: Investigar + Crear

1) Busca fuentes con serper-search.js (si está disponible) o con WebSearch.
2) Genera HTML con: H1, 3-6 secciones con H2, bullets, sección Fuentes con links reales.
3) Genera también: meta-title (max 60 chars), meta-description (max 155 chars), excerpt, tags.
4) Guarda el HTML en `ghost-draft.html` dentro de `workspace/`.
5) Publica:

```bash
node ghost-post.js \
  --title "<título>" \
  --status draft \
  --tags "<tag1,tag2>" \
  --html-file ghost-draft.html \
  --meta-title "<meta title>" \
  --meta-description "<meta description>" \
  --excerpt "<excerpt>"
```

6) Reporta el link/id del post creado.

## Pipeline: Crear directo

Igual que arriba pero sin paso de búsqueda. Usa cuando el usuario ya dió el contenido.

## Pipeline: Editar draft existente

```bash
node ghost-post.js \
  --update-title "<título del draft>" \
  --title "<título>" \
  --status draft \
  --tags "<tags>" \
  --html-file ghost-draft.html \
  --meta-title "<meta>" \
  --meta-description "<meta desc>" \
  --excerpt "<excerpt>"
```

## Manejo de errores

- Si ghost-post.js falla, reporta el error exacto. NUNCA confirmes publicación si el comando falló.
- Si la verificación post-creación reporta "WARN: HTML vacío", avisa al usuario.
- Si falta una variable de entorno, reporta cuál falta.

## Variables requeridas (ya en workspace/.env)

- `GHOST_API_URL`
- `GHOST_ADMIN_API_KEY`
- `GHOST_CONTENT_API_KEY` (opcional para lectura)
