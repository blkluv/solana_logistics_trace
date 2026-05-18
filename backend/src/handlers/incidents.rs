//! GET incidencias por envío (off-chain + on-chain replicadas).

use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::{get, State};
use serde::Serialize;
use serde_json::{json, Value};
use sqlx::PgPool;
use uuid::Uuid;

use crate::incident_engine::repositories::incidents::{self, IncidentRow};
use crate::repos::shipments;
use crate::wallet_query::{require_wallet_form, WalletQuery};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IncidentApiItem {
    pub id: Uuid,
    pub shipment_id: Uuid,
    pub incident_type: String,
    pub severity: String,
    pub status: String,
    pub source: String,
    pub description: String,
    pub detected_at: chrono::DateTime<chrono::Utc>,
    pub resolved_at: Option<chrono::DateTime<chrono::Utc>>,
    pub rule_name: Option<String>,
    pub tx_hash: Option<String>,
}

fn row_to_api(r: IncidentRow) -> IncidentApiItem {
    IncidentApiItem {
        id: r.id,
        shipment_id: r.shipment_id,
        incident_type: r.incident_type,
        severity: r.severity,
        status: r.status,
        source: r.source,
        description: r.description,
        detected_at: r.detected_at,
        resolved_at: r.resolved_at,
        rule_name: r.rule_name,
        tx_hash: r.tx_hash,
    }
}

#[get("/shipments/<shipment_id>/incidents?<q..>")]
pub async fn list_shipment_incidents(
    pool: &State<PgPool>,
    shipment_id: Uuid,
    q: WalletQuery<'_>,
) -> Result<Json<Vec<IncidentApiItem>>, (Status, Json<Value>)> {
    let w = require_wallet_form(&q)?;
    if shipments::select_shipment_detail_for_wallet(pool.inner(), shipment_id, w)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(json!({"error": "database error"})),
            )
        })?
        .is_none()
    {
        return Err((
            Status::NotFound,
            Json(json!({"error": "shipment not found"})),
        ));
    }

    let rows = incidents::list_by_shipment(pool.inner(), shipment_id)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(json!({"error": "database error"})),
            )
        })?;

    Ok(Json(rows.into_iter().map(row_to_api).collect()))
}
