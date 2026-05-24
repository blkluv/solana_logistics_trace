# Backend — TraceSol Logistics

API HTTP en **Rust** (Rocket) con **PostgreSQL** (SQLx). Sincroniza transacciones Solana, expone consultas y ejecuta el motor de incidencias.

Documentación general: [README principal](../README.md).

---

## Responsabilidades

- Sync on-chain → Postgres: `POST /api/v1/{actors,shipments,checkpoints,incidents}/sync`
- Consultas de envíos, checkpoints, incidencias, telemetría
- Catálogos de solo lectura
- `GET /health` en la raíz del servidor

---

## Requisitos

- Rust (edición 2021)
- PostgreSQL — [infra/README.md](../infra/README.md)
- `PROGRAM_ID` y RPC Solana alineados con el frontend

---

## Configuración

```bash
docker compose -f infra/docker-compose.yml up -d
cd backend
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Postgres |
| `BACKEND_PORT` | Puerto (default `8000`) |
| `CORS_ALLOWED_ORIGINS` | Origen Next.js |
| `PROGRAM_ID` | Igual que `NEXT_PUBLIC_PROGRAM_ID` |
| `SOLANA_RPC_URL` | RPC de lectura |

Referencia: [`.env.example`](../.env.example).

---

## Ejecución

```bash
cargo run
```

Migraciones automáticas al iniciar. API: `http://localhost:8000/api/v1`.

Cada archivo en `migrations/` debe tener un **prefijo de versión único** (`YYYYMMDDHHMMSS`). Si sqlx indica *«migration X was previously applied but has been modified»*, suele haber dos scripts con el mismo prefijo o el archivo cambió tras aplicarse; no edites migraciones ya aplicadas — crea una nueva con otro timestamp.

---

## Endpoints principales

**Sync:** `POST /api/v1/actors|shipments|checkpoints|incidents/sync` — cuerpo `{ "tx_hash": "..." }`.

**Consulta:** `GET /api/v1/shipments`, `GET /api/v1/public/shipments/:id`, incidencias, telemetría, hub.

**Catálogos:** `GET /api/v1/catalogs/*`

---

## Pruebas

```bash
cargo test
```

---

## Orden de arranque

1. [infra](../infra/README.md) → 2. [Anchor](../programs/logistics_traceability/README.md) → 3. **Backend** → 4. [frontend](../frontend/README.md)

---

## Rama Git

Rama `backend` → merge a `main`.
