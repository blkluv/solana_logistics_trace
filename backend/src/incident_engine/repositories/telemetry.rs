//! Persistencia de `telemetry_events` por `shipment_id` (UUID).

use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::incident_engine::models::TelemetryEvent;

pub async fn insert(
    pool: &PgPool,
    event: &TelemetryEvent,
) -> Result<Uuid, sqlx::Error> {
    sqlx::query_scalar(
        r#"INSERT INTO telemetry_events (
               shipment_id, telemetry_type, value_numeric, latitude, longitude,
               metadata_json, recorded_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id"#,
    )
    .bind(event.shipment_id)
    .bind(&event.telemetry_type)
    .bind(event.value_numeric)
    .bind(event.latitude)
    .bind(event.longitude)
    .bind(event.metadata_json.as_ref().map(sqlx::types::Json))
    .bind(event.recorded_at)
    .fetch_one(pool)
    .await
}

pub async fn latest_recorded_at(
    pool: &PgPool,
    shipment_id: Uuid,
    telemetry_type: &str,
) -> Result<Option<DateTime<Utc>>, sqlx::Error> {
    sqlx::query_scalar(
        r#"SELECT recorded_at FROM telemetry_events
           WHERE shipment_id = $1 AND telemetry_type = $2
           ORDER BY recorded_at DESC LIMIT 1"#,
    )
    .bind(shipment_id)
    .bind(telemetry_type)
    .fetch_optional(pool)
    .await
}

pub async fn latest_temperature(
    pool: &PgPool,
    shipment_id: Uuid,
) -> Result<Option<f64>, sqlx::Error> {
    sqlx::query_scalar(
        r#"SELECT value_numeric FROM telemetry_events
           WHERE shipment_id = $1 AND telemetry_type = 'temperature'
           ORDER BY recorded_at DESC LIMIT 1"#,
    )
    .bind(shipment_id)
    .fetch_optional(pool)
    .await
}
