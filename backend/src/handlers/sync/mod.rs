//! Etapa 1 sync HTTP handlers (thin).

mod actor;
mod checkpoint;
mod incident;
mod shipment;

pub use actor::post_sync_actor;
pub use checkpoint::post_sync_checkpoint;
pub use incident::post_sync_incident;
pub use shipment::post_sync_shipment;

use rocket::http::Status;
use rocket::serde::json::Json;
use serde_json::json;

use crate::solana::SolanaSyncError;

pub(super) fn map_sync_error(e: SolanaSyncError) -> (Status, Json<serde_json::Value>) {
    let status = match &e {
        SolanaSyncError::TxNotFound => Status::NotFound,
        SolanaSyncError::WrongProgram | SolanaSyncError::WrongInstruction => {
            Status::UnprocessableEntity
        }
        SolanaSyncError::MalformedTransaction | SolanaSyncError::AccountDecode => {
            Status::UnprocessableEntity
        }
        SolanaSyncError::Conflict(_) => Status::Conflict,
        SolanaSyncError::Validation(_) => Status::BadRequest,
        SolanaSyncError::Upstream(_) => Status::BadGateway,
    };
    (
        status,
        Json(json!({
            "error": e.to_string(),
        })),
    )
}
