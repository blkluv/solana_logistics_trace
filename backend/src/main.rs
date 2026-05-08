use std::sync::Arc;

use logistics_trace_backend::{
    build_rocket, config::AppConfig, cors, db, solana::rpc_http::HttpSolanaRpcClient,
    solana::SolanaRpcClient,
};

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    dotenvy::dotenv().ok();
    let cfg = AppConfig::from_env();

    if cfg.database_url.is_empty() {
        eprintln!("DATABASE_URL must be set (copy .env.example to .env)");
        std::process::exit(1);
    }

    if cfg.program_id.is_empty() {
        eprintln!(
            "warning: PROGRAM_ID unset — Etapa 1 POST /api/v1/*/sync endpoints will return 503"
        );
    }

    let pool = db::create_pool(&cfg.database_url)
        .await
        .unwrap_or_else(|e| panic!("PostgreSQL pool: {e}"));

    db::run_migrations(&pool)
        .await
        .unwrap_or_else(|e| panic!("database migrations: {e}"));

    let solana: Arc<dyn SolanaRpcClient> =
        Arc::new(HttpSolanaRpcClient::new(cfg.solana_rpc_url.clone()));

    let cors_policy = cors::cors_for_origins(&cfg.cors_allowed_origins);
    let figment = rocket::Config::figment().merge(("port", cfg.backend_port));

    build_rocket(pool, cors_policy, solana, cfg.clone())
        .configure(figment)
        .launch()
        .await?;

    Ok(())
}
