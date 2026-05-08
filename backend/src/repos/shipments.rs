use chrono::{DateTime, Utc};
use sqlx::{PgPool, Row};
use uuid::Uuid;

pub async fn id_by_creation_tx_hash(
    pool: &PgPool,
    creation_tx_hash: &str,
) -> Result<Option<Uuid>, sqlx::Error> {
    let row = sqlx::query(r#"SELECT id FROM shipments WHERE creation_tx_hash = $1"#)
        .bind(creation_tx_hash)
        .fetch_optional(pool)
        .await?;
    match row {
        None => Ok(None),
        Some(r) => {
            let id: Uuid = r.try_get("id")?;
            Ok(Some(id))
        }
    }
}

#[allow(clippy::too_many_arguments)]
pub async fn insert_shipment_returning_id(
    pool: &PgPool,
    on_chain_shipment_id: i64,
    sender_wallet: &str,
    recipient_wallet: &str,
    product: &str,
    origin: &str,
    destination: &str,
    status: &str,
    requires_cold_chain: bool,
    checkpoint_count: i32,
    incident_count: i32,
    created_at: DateTime<Utc>,
    delivered_at: Option<DateTime<Utc>>,
    creation_tx_hash: &str,
) -> Result<Uuid, sqlx::Error> {
    let id: Uuid = sqlx::query_scalar(
        r#"INSERT INTO shipments (
               on_chain_shipment_id, sender_wallet, recipient_wallet, product, origin, destination,
               status, requires_cold_chain, checkpoint_count, incident_count, created_at, delivered_at, creation_tx_hash
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING id"#,
    )
    .bind(on_chain_shipment_id)
    .bind(sender_wallet)
    .bind(recipient_wallet)
    .bind(product)
    .bind(origin)
    .bind(destination)
    .bind(status)
    .bind(requires_cold_chain)
    .bind(checkpoint_count)
    .bind(incident_count)
    .bind(created_at)
    .bind(delivered_at)
    .bind(creation_tx_hash)
    .fetch_one(pool)
    .await?;
    Ok(id)
}
