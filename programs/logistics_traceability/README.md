# `logistics_traceability` — programa Anchor

Programa on-chain (Etapa 1: actor → envío → checkpoint) del workspace `logistics_trace`. Este README cubre **solo** herramientas Anchor, compilación y despliegue.

## Requisitos

- **Rust** `1.89.0` (ver `rust-toolchain.toml` en esta carpeta).
- **Anchor** `0.32.x` (`anchor --version`).
- **Solana CLI** compatible con Agave 2.3 / tu red (`solana --version`).
- Wallet de despliegue por defecto: `~/.config/solana/id.json` (configurable en `Anchor.toml` → `[provider]`).

## Estructura del workspace Anchor

| Ruta | Contenido |
|------|-----------|
| `Anchor.toml` | Cluster, `programs.*`, wallet, script de tests. |
| `programs/logistics_traceability/` | Crate del programa (`src/lib.rs`, `state/`, `instructions/`, `events.rs`). |
| `tests/` | Tests de integración (`anchor-client`, localnet). |
| `target/deploy/` | `logistics_traceability.so` y **keypair del programa** (`*-keypair.json`). |

El **program id** efectivo debe coincidir entre:

- `declare_id!(...)` en `programs/logistics_traceability/src/lib.rs`
- `[programs.localnet]` (o `devnet` / `mainnet`) en `Anchor.toml`
- la keypair en `target/deploy/logistics_traceability-keypair.json`

Para alinear fuente y TOML con la keypair de deploy:

```bash
anchor keys sync -p logistics_traceability
anchor build
```

> **Importante:** respalda `target/deploy/logistics_traceability-keypair.json`. Si se regenera, cambia el program id en cadena y en clientes (frontend/backend); no subas la keypair a git si la política del repo la excluye.

## Compilación

Desde **esta carpeta** (`logistics_trace/programs/logistics_traceability`):

```bash
anchor build
```

Esto genera el `.so` en `target/deploy/` y el IDL en `target/idl/`.

### `CARGO_TARGET_DIR` y `/tmp`

Si tu entorno exporta `CARGO_TARGET_DIR` (p. ej. sandbox de IDE) o el `tmpfs` de `/tmp` está lleno, puede fallar rustc. En ese caso:

```bash
unset CARGO_TARGET_DIR
# opcional:
export TMPDIR="$HOME/.tmp"
mkdir -p "$TMPDIR"
anchor build
```

## Localnet: validador y despliegue

**1. Levantar el validador**

```bash
solana-test-validator --reset   # opcional: ledger limpio antes de tests
```

**2. Apuntar el CLI**

```bash
solana config set --url localhost
```

**3. Build y deploy**

```bash
cd …/logistics_trace/programs/logistics_traceability
unset CARGO_TARGET_DIR    # recomendado si Cursor u otra herramienta lo fija
anchor build
anchor deploy
```

`anchor deploy` usa la URL de `[provider]` en `Anchor.toml` (por defecto localnet `http://127.0.0.1:8899`).

## Tests (integración)

Los tests del paquete `tests` hablan por RPC con el programa desplegado; hace falta **validador en marcha** y **programa desplegado** con el mismo `declare_id`.

```bash
cd …/logistics_trace/programs/logistics_traceability
cargo test -p tests --lib -- --test-threads=1
```

O el script definido en `Anchor.toml`:

```bash
anchor test
```

(Anchor puede levantar entorno según versión y flags; si ya tienes `solana-test-validator` manual, revisa `anchor test --help` para `--skip-local-validator` u opciones equivalentes.)

## Otras redes (referencia)

Para **devnet** (tras añadir la entrada en `Anchor.toml` y fondos en la wallet):

```bash
anchor build
anchor deploy --provider.cluster devnet
```

Ajusta `[programs.devnet]` y vuelve a **`anchor keys sync`** si cambias keypair o cluster de forma coordinada con el equipo.

## Comandos útiles

| Objetivo | Comando |
|----------|---------|
| Ver program id de la keypair de deploy | `solana-keygen pubkey target/deploy/logistics_traceability-keypair.json` |
| Limpiar artefactos Anchor | `anchor clean` |
| Ver IDL generado | `target/idl/logistics_traceability.json` |

---

*Documento acotado a Anchor y despliegue; pipeline backend/frontend y sync HTTP no se describen aquí.*
