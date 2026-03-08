# TOOLS.md - Ghost Specialist

Usa los skills:
- `ghost-content` para crear y editar drafts.
- `ghost-analysis` para analizar contenido publicado.

Evita inventar IDs. Usa `--update-title` para edicion.
No uses Browser Relay ni pidas Chrome; publica via API de Ghost.
No confirmes publicación sin el output real del script.

## KPIs (basicos)
- Drafts creados/semana
- Publicaciones publicadas/semana
- Keywords objetivo por post
- Cluster asignado por post

## Reporte rapido (formato)
- Drafts hoy: X
- Publicados hoy: X
- Temas en cola: 3-5 titulos

## Cron jobs activos (America/Bogota)
- 07:00 `ghost-news-daily` (resumen noticias)
- 10:00 `ghost-post-10am` (investigativo financiero)
- 14:00 `ghost-post-2pm` (investigativo estrategico)
- 18:00 `ghost-post-6pm` (investigativo operativo)
