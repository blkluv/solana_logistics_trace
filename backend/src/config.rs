use std::env;

/// Runtime settings loaded from the environment (see root `.env.example`).
#[derive(Debug, Clone)]
pub struct AppConfig {
    pub backend_port: u16,
    pub database_url: String,
    pub cors_allowed_origins: Vec<String>,
    pub solana_rpc_url: String,
    /// Base58 program id for sync validation (§9).
    pub program_id: String,
    pub incident_engine_enabled: bool,
}

fn parse_origins(raw: &str) -> Vec<String> {
    raw.split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}

impl AppConfig {
    pub fn from_env() -> Self {
        let backend_port = env::var("BACKEND_PORT")
            .ok()
            .and_then(|s| s.parse().ok())
            .unwrap_or(8000);

        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| String::new());

        let cors_allowed_origins = match env::var("CORS_ALLOWED_ORIGINS") {
            Ok(s) => {
                let parsed = parse_origins(&s);
                if parsed.is_empty() {
                    parse_origins("http://localhost:3000")
                } else {
                    parsed
                }
            }
            Err(_) => parse_origins("http://localhost:3000"),
        };

        let solana_rpc_url = env::var("SOLANA_RPC_URL")
            .unwrap_or_else(|_| "http://127.0.0.1:8899".into());

        let mut program_id = env::var("PROGRAM_ID").unwrap_or_else(|_| String::new());
        program_id = program_id.trim().to_string();
        // `.env.example` placeholder — not a real pubkey; behave like unset (sync → 503).
        if program_id.eq_ignore_ascii_case("ReplaceWithProgramIdAfterDeploy") {
            eprintln!(
                "warning: PROGRAM_ID is still the template value — treating as unset; set a real base58 program id for POST /api/v1/*/sync"
            );
            program_id.clear();
        }
        if !program_id.is_empty() && !valid_solana_pubkey_base58(&program_id) {
            eprintln!("PROGRAM_ID is set but is not a valid base58 32-byte pubkey");
            std::process::exit(1);
        }

        let incident_engine_enabled = env::var("INCIDENT_ENGINE_ENABLED")
            .ok()
            .map(|s| !matches!(s.as_str(), "0" | "false" | "FALSE" | "no" | "NO"))
            .unwrap_or(true);

        Self {
            backend_port,
            database_url,
            cors_allowed_origins,
            solana_rpc_url,
            program_id,
            incident_engine_enabled,
        }
    }

    /// Minimal config for unit tests (health + CORS); sync routes need real `PROGRAM_ID`.
    pub fn for_tests() -> Self {
        Self {
            backend_port: 8000,
            database_url: String::new(),
            cors_allowed_origins: vec!["http://localhost:3000".into()],
            solana_rpc_url: "http://127.0.0.1:8899".into(),
            program_id: "BPFLoaderUpgradeab1e11111111111111111111111".into(),
            incident_engine_enabled: false,
        }
    }
}

fn valid_solana_pubkey_base58(s: &str) -> bool {
    bs58::decode(s)
        .into_vec()
        .map(|v| v.len() == 32)
        .unwrap_or(false)
}
