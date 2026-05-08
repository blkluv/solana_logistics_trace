use std::path::Path;

use sqlx::migrate::Migrator;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

pub async fn create_pool(database_url: &str) -> Result<PgPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(10)
        .connect(database_url)
        .await
}

/// Applies SQLx migrations from `backend/migrations` (runtime, no compile-time DB).
pub async fn run_migrations(pool: &PgPool) -> Result<(), sqlx::migrate::MigrateError> {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("migrations");
    Migrator::new(dir).await?.run(pool).await
}
