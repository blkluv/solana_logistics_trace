# Frontend TraceSol (Next.js)

Interfaz del proyecto `logistics_trace`: landing, demo Etapa 1 (`/demo`), panel y conexión Phantom.

## Requisitos

- Node.js acorde a `package.json`
- Backend y Postgres opcionales pero necesarios para **sync HTTP** tras cada transacción firmada

## Variables de entorno

Copia la plantilla y renómbrala como indica Next.js:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SOLANA_RPC_URL` | RPC que usa el navegador (debe coincidir con la red donde está desplegado el programa). |
| `NEXT_PUBLIC_PROGRAM_ID` | Program ID base58; mismo valor que `PROGRAM_ID` del backend. |
| `NEXT_PUBLIC_API_BASE_URL` | URL hasta **`/api/v1`**, sin barra final (p. ej. `http://localhost:8000/api/v1`). Si queda vacío, el demo **omite** las llamadas sync. |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Etiqueta de red (localnet, devnet, etc.). |

Referencia ampliada: `.env.example` en la raíz del monorepo `logistics_trace`.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La demo Etapa 1 está en `/demo`.

## Otros comandos

```bash
npm run lint
npm run build
npm test
```
