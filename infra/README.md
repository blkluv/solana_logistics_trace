# Infraestructura local

## PostgreSQL

Servicio definido en `docker-compose.yml` (usuario, contraseña y base alineados con `.env.example` del repo).

```bash
# Desde la raíz de logistics_trace:
docker compose -f infra/docker-compose.yml up -d
docker compose -f infra/docker-compose.yml ps
```

Para parar y conservar datos:

```bash
docker compose -f infra/docker-compose.yml stop
```

## Variables de entorno

| Ubicación | Uso |
|-----------|-----|
| `backend/.env.example` | Plantilla para ejecutar Rocket desde `backend/` |
| `frontend/.env.example` | Plantilla para Next (`cp` → `.env.local`) |
| `../.env.example` | Vista completa monorepo |

El frontend debe usar `NEXT_PUBLIC_API_BASE_URL` apuntando al API con sufijo **`/api/v1`** (p. ej. `http://localhost:8000/api/v1`).
