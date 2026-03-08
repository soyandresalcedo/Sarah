---
name: seo-intelligence
description: >
  Análisis SEO avanzado con Google Search Console: salud del sitio, cruce por países,
  evolución temporal, oportunidades de posicionamiento, análisis por dispositivo, y
  generación de planes de contenido basados en datos reales. Úsalo siempre que pidan
  datos SEO, análisis GSC, insights de búsqueda, o planes de contenido basados en datos.
---

# SEO Intelligence

## Regla de oro

Eres autónomo. Cuando el usuario pide análisis SEO, **ejecuta** los comandos necesarios
sin pedir permiso. Narra brevemente qué estás haciendo (estilo Cursor) y entrega
resultados como datos estructurados compactos, no parrafos largos.

## Herramienta

Un solo script: `node ./seo-gsc.js [flags]`

### Flags disponibles

| Flag | Descripción | Ejemplo |
|------|-------------|---------|
| `--endpoint` | Endpoint: `summary`, `queries`, `pages` | `--endpoint queries` |
| `--dimensions` | Dimensiones CSV (auto-usa endpoint `explore`) | `--dimensions query,country` |
| `--days` | Días hacia atrás (default 28) | `--days 90` |
| `--startDate` | Fecha inicio YYYY-MM-DD | `--startDate 2026-01-01` |
| `--endDate` | Fecha fin YYYY-MM-DD | `--endDate 2026-03-01` |
| `--compare` | Comparar con periodo anterior | `--compare previous` |
| `--rowLimit` | Máx filas (default 250, explore 500) | `--rowLimit 1000` |
| `--startRow` | Offset para paginación | `--startRow 250` |
| `--searchType` | Tipo: `web`, `image`, `video`, `news` | `--searchType news` |
| `--filterDimension` | Dimensión a filtrar | `--filterDimension country` |
| `--filterOperator` | Operador: `equals`, `contains`, `notEquals`, `includingRegex`, `excludingRegex`, `notContains` | `--filterOperator equals` |
| `--filterExpression` | Valor del filtro | `--filterExpression col` |
| `--includeInsights` | Incluir insights automáticos (true/false) | `--includeInsights true` |

### Dimensiones válidas

`query`, `page`, `country`, `device`, `date`, `searchAppearance`

Se pueden combinar: `--dimensions query,country` devuelve cada query desglosada por país.

### Códigos de país GSC

3 letras minúsculas: `col` (Colombia), `mex` (México), `esp` (España), `usa` (EEUU),
`arg` (Argentina), `per` (Perú), `chl` (Chile), `bra` (Brasil).

### Salida

- `stdout`: JSON con `{ ok, rows[], summary, insights, dateRange, dimensions, filter }`
- `stderr`: errores (e.g. `Error: Falta OPENCLAW_SEO_API_KEY`)
- Cada row tiene `keys[]` (valores de las dimensiones en orden), `clicks`, `impressions`, `ctr`, `position`

### Errores comunes

| Error | Causa | Acción |
|-------|-------|--------|
| `Falta OPENCLAW_SEO_API_KEY` | Variable no configurada | Informa al usuario que falta la API key |
| `Missing siteUrl` | No hay sitio configurado | Agrega `--siteUrl sc-domain:edtools.co` |
| `Missing dimensions param` | Usaste explore sin dimensiones | Agrega `--dimensions query,country` |
| `Invalid dimension: X` | Dimensión no soportada | Usa una de las válidas |
| `GSC request failed` | Error upstream de Google | Reintenta en 30s; si persiste, reporta |

## Modos de análisis

Decide automáticamente qué modo(s) ejecutar según lo que pida el usuario.
Si el pedido es vago ("¿cómo va el SEO?"), ejecuta **Salud** + **Oportunidades**.

### 1. Salud rápida

Visión general del sitio con comparación período anterior.

```bash
node ./seo-gsc.js --endpoint summary --compare previous
```

Entrega:
- Clicks, impressions, CTR, posición promedio (actual vs anterior)
- Deltas con flechas: ↑ mejora, ↓ caída, → estable
- Top 5 queries por clicks

### 2. Análisis por países

Dónde rankean las queries por mercado geográfico.

```bash
node ./seo-gsc.js --dimensions query,country --rowLimit 500
```

Para un país específico:
```bash
node ./seo-gsc.js --dimensions query --filterDimension country --filterOperator equals --filterExpression col --rowLimit 200
```

Entrega:
- Tabla por país: queries principales, posición, impressions, CTR
- Oportunidades por mercado (posición 8-20 en un país pero no en otro)
- Mercados sin presencia donde hay demanda

### 3. Evolución temporal

Cómo se mueve una query o grupo de queries en el tiempo.

```bash
node ./seo-gsc.js --dimensions query,date --days 90 --filterDimension query --filterOperator contains --filterExpression "enrollment" --rowLimit 1000
```

Entrega:
- Tendencia de posición/clicks por semana (agrupa rows por date)
- Identifica subidas, caídas y estabilidad
- Formato compacto: `sem 1: pos 15.2 → sem 12: pos 8.7 (↑6.5)`

### 4. Oportunidades

Queries con alto potencial de mejora.

```bash
node ./seo-gsc.js --endpoint queries --rowLimit 500 --includeInsights true
```

Del JSON de `insights`, extrae:
- `positions8to20`: queries a punto de entrar al top — mejora de title/H1 o contenido
- `lowCtrHighImpressions`: queries con muchas vistas pero nadie hace clic — mejorar meta description/title

Entrega tabla compacta:
```
"admissions crm" | pos 11.2 | 680 imp | 0.8% CTR → optimizar title + agregar CTA
"enrollment management software" | pos 18.4 | 320 imp | 0.3% CTR → nuevo artículo
```

### 5. Análisis por dispositivo

Diferencias entre móvil y desktop.

```bash
node ./seo-gsc.js --dimensions query,device --rowLimit 300
```

Entrega:
- Queries donde móvil rankea significativamente diferente a desktop
- CTR gaps (si móvil tiene CTR mucho menor → problemas de UX móvil)

### 6. Plan de contenido

Combina múltiples análisis para generar un plan accionable.

**Ejecuta en secuencia:**
1. Salud rápida (contexto general)
2. Oportunidades (dónde actuar)
3. Países si es relevante (priorizar mercados)

**Entrega:**
- 3-5 acciones concretas con prioridad (alta/media/baja)
- Cada acción especifica: query objetivo, tipo (nuevo artículo / update / mejora title), impacto estimado
- Formato tabla:

```
# | Prioridad | Acción | Query | Impacto estimado
1 | ALTA | Nuevo artículo | "enrollment analytics" | 500 imp/mes, pos 15→5
2 | ALTA | Optimizar title | "admissions crm" | 680 imp, CTR 0.8%→3%
3 | MEDIA | Update contenido | "student portal" | pos 8.2, necesita depth
```

## Formato de salida

- **Datos siempre como tablas compactas o listas**, nunca como párrafos narrativos
- Usa `|` para tablas, flechas `↑↓→` para tendencias
- Redondea posiciones a 1 decimal, CTR a 1 decimal con `%`
- Impresiones y clicks como números enteros
- País como nombre completo en español (Colombia, México, no "col", "mex")
- Si hay más de 20 filas, muestra top 10 y menciona "X más disponibles"

## Variables requeridas

- `OPENCLAW_SEO_API_KEY` — obligatoria
- `OPENCLAW_GSC_SITE_URL` — recomendada (evita pasar `--siteUrl` cada vez)
- `OPENCLAW_SEO_API_BASE` — opcional (default: http://localhost:8080)
