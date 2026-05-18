//! `shipment_monitoring` — inicio/parada por envío.

use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

pub async fn start_monitoring(pool: &PgPool, shipment_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"INSERT INTO shipment_monitoring (shipment_id, status, started_at)
           VALUES ($1, 'active', now())
           ON CONFLICT (shipment_id) DO UPDATE SET
               status = 'active',
               started_at = now(),
               stopped_at = NULL"#,
    )
    .bind(shipment_id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn stop_monitoring(pool: &PgPool, shipment_id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"UPDATE shipment_monitoring
           SET status = 'stopped', stopped_at = now()
           WHERE shipment_id = $1"#,
    )
    .bind(shipment_id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn stop_monitoring_tx(
    tx: &mut sqlx::Transaction<'_, sqlx::Postgres>,
    shipment_id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"UPDATE shipment_monitoring
           SET status = 'stopped', stopped_at = now()
           WHERE shipment_id = $1"#,
    )
    .bind(shipment_id)
    .execute(&mut **tx)
    .await?;
    Ok(())
}

pub async fn list_active_shipment_ids(pool: &PgPool) -> Result<Vec<Uuid>, sqlx::Error> {
    sqlx::query_scalar(
        r#"SELECT shipment_id FROM shipment_monitoring WHERE status = 'active'"#,
    )
    .fetch_all(pool)
    .await
}

pub async fn is_active(pool: &PgPool, shipment_id: Uuid) -> Result<bool, sqlx::Error> {
    let status: Option<String> = sqlx::query_scalar(
        r#"SELECT status FROM shipment_monitoring WHERE shipment_id = $1"#,
    )
    .bind(shipment_id)
    .fetch_optional(pool)
    .await?;
    Ok(status.as_deref() == Some("active"))
}

pub async fn touch_last_checkpoint(
    pool: &PgPool,
    shipment_id: Uuid,
    at: DateTime<Utc>,
) -> Result<(), sqlx::Error> {
    sqlx::query(r#"UPDATE shipments SET last_checkpoint_at = $2 WHERE id = $1"#)
        .bind(shipment_id)
        .bind(at)
        .execute(pool)
        .await?;
    Ok(())
}
