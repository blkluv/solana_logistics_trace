use serde_json::Value;
use sqlx::types::Json;
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

pub async fn checkpoint_id_by_tx_hash(
    pool: &PgPool,
    tx_hash: &str,
) -> Result<Option<i64>, sqlx::Error> {
    sqlx::query_scalar(r#"SELECT id FROM checkpoints WHERE tx_hash = $1"#)
        .bind(tx_hash)
        .fetch_optional(pool)
        .await
}

pub async fn shipment_db_id_by_on_chain_id(
    pool: &PgPool,
    on_chain_shipment_id: i64,
) -> Result<Option<Uuid>, sqlx::Error> {
    sqlx::query_scalar(r#"SELECT id FROM shipments WHERE on_chain_shipment_id = $1"#)
        .bind(on_chain_shipment_id)
        .fetch_optional(pool)
        .await
}

#[allow(clippy::too_many_arguments)]
pub async fn insert_checkpoint(
    tx: &mut Transaction<'_, Postgres>,
    shipment_id: Uuid,
    on_chain_checkpoint_id: i64,
    actor_wallet: &str,
    checkpoint_type: &str,
    location: &str,
    latitude: Option<f64>,
    longitude: Option<f64>,
    temperature: Option<i16>,
    humidity: Option<i16>,
    metadata_json: &Value,
    occurred_at: chrono::DateTime<chrono::Utc>,
    tx_hash: &str,
    slot: Option<i64>,
) -> Result<i64, sqlx::Error> {
    sqlx::query_scalar(
        r#"INSERT INTO checkpoints (
               shipment_id, on_chain_checkpoint_id, actor_wallet, checkpoint_type,
               location, latitude, longitude, temperature_centi, humidity,
               metadata_json, occurred_at, tx_hash, slot
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING id"#,
    )
    .bind(shipment_id)
    .bind(on_chain_checkpoint_id)
    .bind(actor_wallet)
    .bind(checkpoint_type)
    .bind(location)
    .bind(latitude)
    .bind(longitude)
    .bind(temperature)
    .bind(humidity)
    .bind(Json(metadata_json))
    .bind(occurred_at)
    .bind(tx_hash)
    .bind(slot)
    .fetch_one(&mut **tx)
    .await
}

pub async fn select_shipment_status(
    tx: &mut Transaction<'_, Postgres>,
    shipment_id: Uuid,
) -> Result<String, sqlx::Error> {
    sqlx::query_scalar(r#"SELECT status FROM shipments WHERE id = $1"#)
        .bind(shipment_id)
        .fetch_one(&mut **tx)
        .await
}

pub async fn bump_checkpoint_count_update_status(
    tx: &mut Transaction<'_, Postgres>,
    shipment_id: Uuid,
    next_status: Option<&str>,
) -> Result<(), sqlx::Error> {
    if let Some(next) = next_status {
        sqlx::query(
            r#"UPDATE shipments SET checkpoint_count = checkpoint_count + 1, status = $2 WHERE id = $1"#,
        )
        .bind(shipment_id)
        .bind(next)
        .execute(&mut **tx)
        .await?;
    } else {
        sqlx::query(r#"UPDATE shipments SET checkpoint_count = checkpoint_count + 1 WHERE id = $1"#)
            .bind(shipment_id)
            .execute(&mut **tx)
            .await?;
    }
    Ok(())
}
