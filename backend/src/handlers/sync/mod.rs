//! Etapa 1 sync HTTP handlers (thin).

mod actor;

pub use actor::post_sync_actor;

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
