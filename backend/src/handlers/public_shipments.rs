//! Consulta pública de envíos por UUID (sin wallet).

use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use serde_json::{json, Value};
use sqlx::PgPool;
use uuid::Uuid;

use crate::dto::shipment_api::{
    checkpoint_item_from_row, shipment_detail_json_from_row, CheckpointItemJson, ShipmentDetailJson,
};
use crate::repos::checkpoints;
use crate::repos::shipments;

#[rocket::get("/public/shipments/<shipment_id>")]
pub async fn get_public_shipment(
    pool: &State<PgPool>,
    shipment_id: Uuid,
) -> Result<Json<ShipmentDetailJson>, (Status, Json<Value>)> {
    let row = shipments::select_shipment_detail_by_id(pool.inner(), shipment_id)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(json!({"error": "database error"})),
            )
        })?;
    let Some(shipment_row) = row else {
        return Err((
            Status::NotFound,
            Json(json!({"error": "shipment not found"})),
        ));
    };
    let cp_rows = checkpoints::list_for_shipment(pool.inner(), shipment_id)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(json!({"error": "database error"})),
            )
        })?;
    let checkpoints_json: Vec<CheckpointItemJson> =
        cp_rows.into_iter().map(checkpoint_item_from_row).collect();
    Ok(Json(shipment_detail_json_from_row(
        shipment_row,
        checkpoints_json,
    )))
}
