# TraceSol Logistics

Plataforma de **trazabilidad logística** con evidencia verificable en **Solana**: registro de actores, envíos, eventos logísticos (checkpoints), incidencias críticas on-chain, telemetría, motor de alertas y consulta pública.

Monorepo organizado por componentes (`infra`, programa Anchor, backend Rocket, frontend Next.js). Cada módulo tiene su propia guía de arranque; este documento describe el **orden recomendado** y un **inicio rápido** de punta a punta.

---

## Arquitectura

| Componente | Tecnología | Responsabilidad |
|------------|------------|-----------------|
| [infra/](infra/README.md) | Docker Compose | PostgreSQL local para datos operativos |
| [programs/logistics_traceability/](programs/logistics_traceability/README.md) | Anchor / Solana | Contrato: actores, envíos, checkpoints, incidencias críticas |
| [backend/](backend/README.md) | Rust, Rocket, SQLx | API REST, sync on-chain → Postgres, motor de incidencias |
| [frontend/](frontend/README.md) | Next.js, Phantom | UI operativa, consulta pública, consola de sistema |

Flujo habitual: el usuario firma transacciones en el navegador (Phantom) → el **backend** valida la tx en RPC y persiste el estado en **PostgreSQL** → el **frontend** consulta la API para paneles, mapas y líneas de tiempo.

---

## Requisitos previos

- **Docker** y **Docker Compose** (base de datos).
- **Rust** `1.89+`, **Cargo**, **sqlx** (migraciones al arrancar el backend).
- **Solana CLI** y **Anchor** `0.32.x` (programa on-chain).
- **Node.js** acorde a `frontend/package.json` (LTS recomendado).
- Wallet **Phantom** (o compatible) para operaciones firmadas en el navegador.

---

## Orden de arranque (desarrollo local)

| Paso | Componente | Acción |
|------|------------|--------|
| 1 | Infraestructura | Levantar PostgreSQL |
| 2 | Solana | Validador local + compilar y desplegar el programa |
| 3 | Configuración | Alinear `PROGRAM_ID` en backend y frontend |
| 4 | Backend | API Rocket (aplica migraciones SQL al iniciar) |
| 5 | On-chain | Activar programa (`/consola`) y registrar actores |
| 6 | Frontend | Interfaz Next.js |

Detalle en [Inicio rápido](#inicio-rápido) y en el README de cada módulo.

---

## Inicio rápido

Desde la raíz del repositorio (`logistics_trace/`).

### 1. Base de datos

```bash
docker compose -f infra/docker-compose.yml up -d
```

→ [infra/README.md](infra/README.md)

### 2. Validador y programa Anchor

En una terminal aparte:

```bash
solana-test-validator --reset
```

En otra:

```bash
cd programs/logistics_traceability
solana config set --url localhost
anchor build && anchor deploy
solana-keygen pubkey target/deploy/logistics_traceability-keypair.json
```

Copiar el program id a `PROGRAM_ID` (raíz / `backend/.env`) y `NEXT_PUBLIC_PROGRAM_ID` (`frontend/.env.local`). Ver [`.env.example`](.env.example).

→ [programs/logistics_traceability/README.md](programs/logistics_traceability/README.md)

### 3. Backend

```bash
cp .env.example .env   # ajustar DATABASE_URL y PROGRAM_ID
cd backend && cargo run
```

API: `http://localhost:8000/api/v1` — health: `http://localhost:8000/health`

→ [backend/README.md](backend/README.md)

### 4. Activación y actores (navegador)

Con el frontend en marcha (paso 5): abrir `http://localhost:3000/consola`, conectar Phantom e **inicializar** el programa. Luego `/registro` para el primer actor.

### 5. Frontend

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
npm install && npm run dev
```

→ [frontend/README.md](frontend/README.md)

---

## Documentación por módulo

| Módulo | README | Contenido |
|--------|--------|-----------|
| Infraestructura | [infra/README.md](infra/README.md) | Docker, Postgres, variables de conexión |
| Programa Solana | [programs/logistics_traceability/README.md](programs/logistics_traceability/README.md) | Build, deploy, tests Anchor |
| Backend | [backend/README.md](backend/README.md) | API, sync, motor de incidencias, pruebas |
| Frontend | [frontend/README.md](frontend/README.md) | Rutas, env, flujo operativo |
| Assets UI | [frontend/public/imagenes/README.md](frontend/public/imagenes/README.md) | Imágenes estáticas |

---

## Puertos por defecto

| Servicio | Puerto |
|----------|--------|
| PostgreSQL | `5432` |
| Solana RPC (local) | `8899` |
| Backend Rocket | `8000` |
| Next.js | `3000` |

---

## Verificación

```bash
# Backend
cd backend && cargo test

# Frontend
cd frontend && npm test

# Anchor (validador + deploy previos)
cd programs/logistics_traceability && cargo test -p tests --lib -- --test-threads=1
```

---

## Ramas Git

Flujo de integración por componente:

| Rama | Ámbito |
|------|--------|
| `infra` | Docker / Postgres |
| `solana/anchor` | Programa on-chain |
| `backend` | API Rocket |
| `frontend` | Next.js |
| `main` | Integración (`merge --no-ff`) |

---

## Licencia y uso

Proyecto académico / demostración de trazabilidad con Solana. Ajustar credenciales y redes antes de cualquier despliegue real; no commitear secretos ni ledgers locales (`test-ledger/`).
