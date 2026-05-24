# Infraestructura — TraceSol Logistics

Servicios de apoyo para desarrollo local. En esta fase el componente principal es **PostgreSQL**, usado por el backend Rocket.

Documentación general: [README principal](../README.md).

---

## Requisitos

- Docker Engine 20.10+
- Docker Compose V2

---

## PostgreSQL

| Parámetro | Valor por defecto |
|-----------|-------------------|
| Base de datos | `logistics_trace` |
| Usuario | `logistics_user` |
| Contraseña | `logistics_pass` |
| Puerto | `5432` |

### Arranque (desde la raíz del repo)

```bash
docker compose -f infra/docker-compose.yml up -d
docker compose -f infra/docker-compose.yml ps
```

### Parada

```bash
docker compose -f infra/docker-compose.yml stop
```

Volumen persistente: `postgres_data`. Eliminar datos: `docker compose -f infra/docker-compose.yml down -v`.

---

## Conexión con el backend

```env
DATABASE_URL=postgres://logistics_user:logistics_pass@localhost:5432/logistics_trace
```

Ver [`.env.example`](../.env.example) y [backend/README.md](../backend/README.md).

---

## Orden de arranque

1. **Infra** (este módulo)
2. [Programa Solana](../programs/logistics_traceability/README.md)
3. [Backend](../backend/README.md)
4. [Frontend](../frontend/README.md)

---

## Rama Git

Rama `infra` → merge a `main`.
