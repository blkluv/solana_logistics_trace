use chrono::{DateTime, Utc};
use sqlx::PgPool;

pub async fn wallet_by_registration_tx_hash(
    pool: &PgPool,
    tx_hash: &str,
) -> Result<Option<String>, sqlx::Error> {
    sqlx::query_scalar(
        r#"SELECT wallet FROM actors WHERE registration_tx_hash = $1"#,
    )
    .bind(tx_hash)
    .fetch_optional(pool)
    .await
}

pub async fn wallet_exists_for_wallet(
    pool: &PgPool,
    wallet: &str,
) -> Result<Option<String>, sqlx::Error> {
    sqlx::query_scalar(r#"SELECT wallet FROM actors WHERE wallet = $1"#)
        .bind(wallet)
        .fetch_optional(pool)
        .await
}

pub async fn insert_actor(
    pool: &PgPool,
    wallet: &str,
    role: &str,
    name: &str,
    location: Option<&String>,
    is_active: bool,
    shipments_created: i32,
    checkpoints_recorded: i32,
    created_at: DateTime<Utc>,
    registration_tx_hash: &str,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"INSERT INTO actors (wallet, role, name, location, is_active, shipments_created, checkpoints_recorded, created_at, registration_tx_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"#,
    )
    .bind(wallet)
    .bind(role)
    .bind(name)
    .bind(location)
    .bind(is_active)
    .bind(shipments_created)
    .bind(checkpoints_recorded)
    .bind(created_at)
    .bind(registration_tx_hash)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn select_actor_row(
    pool: &PgPool,
    wallet: &str,
) -> Result<(String, String, String, Option<String>, Option<String>), sqlx::Error> {
    sqlx::query_as(
        r#"SELECT wallet, role, name, location, registration_tx_hash FROM actors WHERE wallet = $1"#,
    )
    .bind(wallet)
    .fetch_one(pool)
    .await
}

pub async fn select_actor_optional(
    pool: &PgPool,
    wallet: &str,
) -> Result<Option<(String, String, String, Option<String>, Option<String>)>, sqlx::Error> {
    sqlx::query_as(
        r#"SELECT wallet, role, name, location, registration_tx_hash FROM actors WHERE wallet = $1"#,
    )
    .bind(wallet)
    .fetch_optional(pool)
    .await
}
