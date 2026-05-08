use std::env;

/// Runtime settings loaded from the environment (see root `.env.example`).
#[derive(Debug, Clone)]
pub struct AppConfig {
    pub backend_port: u16,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let backend_port = env::var("BACKEND_PORT")
            .ok()
            .and_then(|s| s.parse().ok())
            .unwrap_or(8000);

        Self { backend_port }
    }
}
