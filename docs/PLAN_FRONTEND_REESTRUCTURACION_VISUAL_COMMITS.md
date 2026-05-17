# Frontend — Reestructuración visual, navegación y consulta pública (plan de commits)

**Estado:** primera iteración implementada en rama `frontend` (consultar Git); pendientes commits 8+ del plan.

**Referencia de proceso:** `TMF-Docs/PLAN_ETAPA2_IMPLEMENTACION_RAMAS_COMMITS.md` (mismo workspace) — **R9** (rama `frontend`), **R10**, **R11**, **R12** (`git merge --no-ff frontend` → `main`).

**Espejo:** copia equivalente en `TMF-Docs/PLAN_FRONTEND_REESTRUCTURACION_VISUAL_COMMITS.md`.

---

## Objetivos de producto

| Área | Descripción |
|------|-------------|
| **Inicio** | Landing de marketing en `/` (refinar copy y CTAs hacia Envíos / Registro / Admin). |
| **Envíos** | Consulta **pública** en `/envios`: criterios (wallet del remitente, ID de envío + wallet participante si el API lo exige), resultados y **timeline** minimalista (etapa actual resaltada). Referencias visuales en `frontend/public/imagenes/`. |
| **Registro** | `/registro` — flujo dedicado a **alta de actor** (enlace o incrustación hacia demo / sync existente). |
| **Admin** | `/admin` — panel **por rol** (Sender, Carrier, …): solo opciones permitidas para ese rol. |
| **Consola** | `/consola` — **administrador general** del sistema: salud del backend, RPC/blockchain, configuración pública (sin mezclar con el panel operativo por rol). |

---

## Dependencias con backend (cuando aplique)

- Listado por wallet del remitente: ya existe `GET /api/v1/shipments?wallet=`.
- Detalle por ID: hoy `GET /api/v1/shipments/:id?wallet=` exige wallet **participante**. La UI pública puede pedir **ID + wallet de consulta** hasta existir un endpoint read-only (p. ej. `GET /api/v1/public/shipments/:id`) — planificar commit en rama **`backend`** y merge `--no-ff` a `main` antes o después del commit de UI que lo consuma.

---

## Orden de commits (rama `frontend`)

Ejecutar **en este orden** dentro de `logistics_trace`; antes de cada merge a `main`: `npm run lint`, `npm test`, `npm run build`.

| # | Asunto del commit (imperativo, ≤72 caracteres) | Alcance |
|---|-----------------------------------------------|---------|
| 1 | `docs(frontend): add UI restructure and commit plan markdown` | Este plan en `logistics_trace/docs/…`. |
| 2 | `chore(frontend): add public/imagenes assets and timeline tokens` | `public/imagenes/README.md`, SVG de apoyo opcional, variables CSS (`--timeline-*`, espaciados). |
| 3 | `feat(frontend): add public envios search and shipment status rail` | `/envios`, `/envios/[shipmentId]`, `ShipmentStatusRail`, `shipmentLifecycle`, integración API existente. |
| 4 | `feat(frontend): add registro actor page and admin role shell` | `/registro`, `/admin` layout + dashboard por rol (placeholders accionables). |
| 5 | `feat(frontend): add owner console for backend and chain health` | `/consola`, lectura `GET /health` (origen API), `GET /api/v1/solana/health`, reutilización de `ClusterPanel` donde encaje. |
| 6 | `feat(frontend): redesign main nav and landing CTAs` | `SiteHeader`, `LandingHome`, `SiteFooter`, redirecciones Next `/panel/envios` → `/envios`. |
| 7 | `refactor(frontend): align panel rail and shipment links with new routes` | `PanelEtapa2Rail`, `ShipmentTracker`, páginas legacy `/panel/*` mínimas o solo redirects. |
| 8 | `style(frontend): polish cards typography and responsive timeline` | Ajustes finos en `tracesol.css` / `globals.css` según assets en `imagenes/`. |
| 9 | `test(frontend): cover shipment lifecycle helpers and public envios flow` | Vitest para orden de etapas y helpers de URL si aplica. |

**Integración:** en `main`, desde `logistics_trace`:

```bash
git checkout main && git merge --no-ff frontend -m "Merge branch 'frontend' into main (UI restructure)"
```

---

## Commits futuros (opcional, rama `backend`)

| Asunto sugerido |
|------------------|
| `feat(backend): add public read-only shipment detail by uuid` |

---

## Carpeta `imagenes`

Colocar en **`logistics_trace/frontend/public/imagenes/`** (servidas en `/imagenes/*`): logos, texturas de línea de tiempo, iconos de etapa. El `README` en esa carpeta describe nombres sugeridos y uso en CSS (`url('/imagenes/...')`).
