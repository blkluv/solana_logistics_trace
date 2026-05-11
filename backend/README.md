# Backend `logistics_trace` (Rocket + PostgreSQL)

API HTTP Etapa 1: sincronización on-chain → Postgres (`POST /api/v1/*/sync`) y health check.

## Configuración

1. Base de datos: desde la raíz del repo, `docker compose -f infra/docker-compose.yml up -d` (ver `infra/README.md`).
2. Copiar variables de entorno:

   ```bash
   cp .env.example .env
   ```

   Ajustar `DATABASE_URL`, `PROGRAM_ID` (id real tras `anchor deploy`), `SOLANA_RPC_URL` y `CORS_ALLOWED_ORIGINS` (origen del Next.js, p. ej. `http://localhost:3000`).

3. El **`PROGRAM_ID`** debe ser el mismo que `NEXT_PUBLIC_PROGRAM_ID` en el frontend.

## Ejecución

```bash
cargo run
```

Por defecto escucha en el puerto definido por `BACKEND_PORT` (8000). Rutas sync bajo **`/api/v1`** (p. ej. `POST /api/v1/actors/sync`). Health: **`GET /health`** en la raíz del servidor (`http://localhost:8000/health`).

### Catálogos (solo lectura, Etapa 1)

JSON: arreglo de `{ code, label, description, sort_order }` (`sort_order` es entero; filas con `is_active = false` no se listan).

| Método | Ruta |
|--------|------|
| `GET` | `/api/v1/catalogs/actor-roles` |
| `GET` | `/api/v1/catalogs/checkpoint-types` |
| `GET` | `/api/v1/catalogs/shipment-statuses` |
| `GET` | `/api/v1/catalogs/incident-types` |

## Referencia global de entorno

En la raíz del monorepo existe `.env.example` con todas las variables (app + front + back + Solana) para copiar a un único `.env` si tu flujo lo usa así.
