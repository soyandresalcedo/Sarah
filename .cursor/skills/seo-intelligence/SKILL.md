---
name: seo-intelligence
description: >
  Análisis SEO avanzado con Google Search Console. Salud, países, evolución temporal,
  oportunidades, dispositivos, y planes de contenido desde Cursor.
---

# SEO Intelligence (Cursor)

## Herramienta

Script: `node seo-gsc.js [flags]`

**Ejecución**: Desde el directorio `workspace/` del proyecto.

```bash
cd workspace && node seo-gsc.js --endpoint summary --compare previous
```

**NUNCA** uses rutas relativas como `../../seo-gsc.js`. Siempre ejecuta desde `workspace/`.

## Flags

| Flag | Descripción | Ejemplo |
|------|-------------|---------|
| `--endpoint` | `summary`, `queries`, `pages` | `--endpoint queries` |
| `--dimensions` | Dimensiones CSV (auto-usa `explore`) | `--dimensions query,country` |
| `--days` | Días hacia atrás (default 28) | `--days 90` |
| `--compare` | Comparar con periodo anterior | `--compare previous` |
| `--rowLimit` | Máx filas | `--rowLimit 500` |
| `--searchType` | `web`, `image`, `video`, `news` | `--searchType web` |
| `--filterDimension` | Dimensión a filtrar | `--filterDimension country` |
| `--filterOperator` | `equals`, `contains`, `notEquals`, `includingRegex`, `excludingRegex` | `--filterOperator equals` |
| `--filterExpression` | Valor del filtro | `--filterExpression col` |
| `--includeInsights` | Insights automáticos | `--includeInsights true` |

Dimensiones válidas: `query`, `page`, `country`, `device`, `date`, `searchAppearance`.
Países GSC (3 letras): `col`, `mex`, `esp`, `usa`, `arg`, `per`, `chl`, `bra`.

## Modos de análisis

### Salud rápida
```bash
node seo-gsc.js --endpoint summary --compare previous
```

### Análisis por países
```bash
node seo-gsc.js --dimensions query,country --rowLimit 500
```

País específico:
```bash
node seo-gsc.js --dimensions query --filterDimension country --filterOperator equals --filterExpression col
```

### Evolución temporal
```bash
node seo-gsc.js --dimensions query,date --days 90 --filterDimension query --filterOperator contains --filterExpression "enrollment"
```

### Oportunidades
```bash
node seo-gsc.js --endpoint queries --rowLimit 500 --includeInsights true
```

Usa `insights.positions8to20` y `insights.lowCtrHighImpressions` del JSON.

### Dispositivos
```bash
node seo-gsc.js --dimensions query,device --rowLimit 300
```

### Plan de contenido
Ejecuta Salud + Oportunidades + Países y combina en 3-5 acciones con prioridad.

## Formato de salida

- Tablas compactas con `|`, flechas `↑↓→` para tendencias
- Posiciones a 1 decimal, CTR con `%`, impresiones/clicks enteros
- Top 10 si hay más de 20 filas

## Variables requeridas

- `OPENCLAW_SEO_API_KEY`
- `OPENCLAW_GSC_SITE_URL` (recomendada)
- `OPENCLAW_SEO_API_BASE` (default: http://localhost:8080)
