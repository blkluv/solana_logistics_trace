//! GET `/api/v1/shipments*` — Etapa 2 §8.2.

use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use serde_json::{json, Value};
use sqlx::PgPool;
use uuid::Uuid;

use crate::dto::shipment_api::{
    checkpoint_item_from_row, shipment_detail_json_from_row, shipment_list_item_from_row,
    CheckpointItemJson, ShipmentDetailJson, ShipmentListItemJson,
};
use crate::repos::checkpoints;
use crate::repos::shipments;
use crate::wallet_query::{require_wallet_form, WalletQuery};

#[rocket::get("/shipments?<q..>")]
pub async fn list_shipments(
    pool: &State<PgPool>,
    q: WalletQuery<'_>,
) -> Result<Json<Vec<ShipmentListItemJson>>, (Status, Json<Value>)> {
    let w = require_wallet_form(&q)?;
    let rows = shipments::list_shipments_for_wallet(pool.inner(), w)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(json!({"error": "database error"})),
            )
        })?;
    Ok(Json(
        rows.into_iter()
            .map(shipment_list_item_from_row)
            .collect(),
    ))
}

#[rocket::get("/shipments/<shipment_id>/checkpoints?<q..>")]
pub async fn list_shipment_checkpoints(
    pool: &State<PgPool>,
    shipment_id: Uuid,
    q: WalletQuery<'_>,
) -> Result<Json<Vec<CheckpointItemJson>>, (Status, Json<Value>)> {
    let w = require_wallet_form(&q)?;
    if shipments::select_shipment_detail_for_participant(pool.inner(), shipment_id, w)
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
    let rows = checkpoints::list_for_shipment_participant(pool.inner(), shipment_id, w)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(json!({"error": "database error"})),
            )
        })?;
    Ok(Json(
        rows.into_iter()
            .map(checkpoint_item_from_row)
            .collect(),
    ))
}

#[rocket::get("/shipments/<shipment_id>?<q..>")]
pub async fn get_shipment(
    pool: &State<PgPool>,
    shipment_id: Uuid,
    q: WalletQuery<'_>,
) -> Result<Json<ShipmentDetailJson>, (Status, Json<Value>)> {
    let w = require_wallet_form(&q)?;
    let row = shipments::select_shipment_detail_for_participant(pool.inner(), shipment_id, w)
        .await
        .map_err(|_| {
            (
                Status::InternalServerError,
                Json(json!({"error": "database error"})),
            )
        })?;
    match row {
        None => Err((
            Status::NotFound,
            Json(json!({"error": "shipment not found"})),
        )),
        Some(r) => {
            let cps = checkpoints::list_for_shipment_participant(pool.inner(), shipment_id, w)
                .await
                .map_err(|_| {
                    (
                        Status::InternalServerError,
                        Json(json!({"error": "database error"})),
                    )
                })?;
            let checkpoints_json: Vec<CheckpointItemJson> =
                cps.into_iter().map(checkpoint_item_from_row).collect();
            Ok(Json(shipment_detail_json_from_row(r, checkpoints_json)))
        }
    }
}
