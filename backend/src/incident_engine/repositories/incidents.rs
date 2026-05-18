//! Persistencia de `incidents`.

use chrono::{DateTime, Utc};
use serde_json::Value;
use sqlx::PgPool;
use uuid::Uuid;

pub async fn insert_auto(
    pool: &PgPool,
    shipment_id: Uuid,
    incident_type: &str,
    severity: &str,
    description: &str,
    evidence_json: &Value,
    rule_name: &str,
) -> Result<Uuid, sqlx::Error> {
    sqlx::query_scalar(
        r#"INSERT INTO incidents (
               shipment_id, incident_type, severity, status, source,
               description, detected_at, evidence_json, rule_name
           ) VALUES ($1, $2, $3, 'Open', 'auto', $4, now(), $5, $6)
           RETURNING id"#,
    )
    .bind(shipment_id)
    .bind(incident_type)
    .bind(severity)
    .bind(description)
    .bind(sqlx::types::Json(evidence_json))
    .bind(rule_name)
    .fetch_one(pool)
    .await
}

pub async fn open_exists(
    pool: &PgPool,
    shipment_id: Uuid,
    incident_type: &str,
) -> Result<bool, sqlx::Error> {
    let n: i64 = sqlx::query_scalar(
        r#"SELECT COUNT(*)::bigint FROM incidents
           WHERE shipment_id = $1 AND incident_type = $2 AND status = 'Open'"#,
    )
    .bind(shipment_id)
    .bind(incident_type)
    .fetch_one(pool)
    .await?;
    Ok(n > 0)
}

pub async fn bump_shipment_incident_count(
    pool: &PgPool,
    shipment_id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"UPDATE shipments SET incident_count = incident_count + 1 WHERE id = $1"#,
    )
    .bind(shipment_id)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn load_shipment_context(
    pool: &PgPool,
    shipment_id: Uuid,
) -> Result<Option<crate::incident_engine::models::ShipmentContext>, sqlx::Error> {
    let row = sqlx::query(
        r#"SELECT requires_cold_chain, origin, destination, last_checkpoint_at
           FROM shipments WHERE id = $1"#,
    )
    .bind(shipment_id)
    .fetch_optional(pool)
    .await?;

    let Some(r) = row else {
        return Ok(None);
    };

    use sqlx::Row;
    Ok(Some(crate::incident_engine::models::ShipmentContext {
        shipment_id,
        requires_cold_chain: r.try_get("requires_cold_chain")?,
        origin: r.try_get("origin")?,
        destination: r.try_get("destination")?,
        last_checkpoint_at: r.try_get("last_checkpoint_at")?,
    }))
}

pub async fn list_by_shipment(
    pool: &PgPool,
    shipment_id: Uuid,
) -> Result<Vec<IncidentRow>, sqlx::Error> {
    let rows = sqlx::query(
        r#"SELECT id, shipment_id, incident_type, severity, status, source,
                  description, detected_at, resolved_at, evidence_json, rule_name, tx_hash
           FROM incidents WHERE shipment_id = $1 ORDER BY detected_at DESC"#,
    )
    .bind(shipment_id)
    .fetch_all(pool)
    .await?;

    rows.iter().map(row_from_pg).collect()
}

fn row_from_pg(row: &sqlx::postgres::PgRow) -> Result<IncidentRow, sqlx::Error> {
    use sqlx::Row;
    Ok(IncidentRow {
        id: row.try_get("id")?,
        shipment_id: row.try_get("shipment_id")?,
        incident_type: row.try_get("incident_type")?,
        severity: row.try_get("severity")?,
        status: row.try_get("status")?,
        source: row.try_get("source")?,
        description: row.try_get("description")?,
        detected_at: row.try_get("detected_at")?,
        resolved_at: row.try_get("resolved_at")?,
        evidence_json: row.try_get("evidence_json")?,
        rule_name: row.try_get("rule_name")?,
        tx_hash: row.try_get("tx_hash")?,
    })
}

#[derive(Debug)]
pub struct IncidentRow {
    pub id: Uuid,
    pub shipment_id: Uuid,
    pub incident_type: String,
    pub severity: String,
    pub status: String,
    pub source: String,
    pub description: String,
    pub detected_at: DateTime<Utc>,
    pub resolved_at: Option<DateTime<Utc>>,
    pub evidence_json: Option<sqlx::types::Json<Value>>,
    pub rule_name: Option<String>,
    pub tx_hash: Option<String>,
}
