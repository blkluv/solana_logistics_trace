//! Shared `wallet` query parsing for Etapa 2 GET endpoints (§8.2).

use rocket::http::Status;
use rocket::serde::json::Json;
use serde_json::{json, Value};

pub fn require_wallet_query(wallet: Option<&str>) -> Result<&str, (Status, Json<Value>)> {
    let w = wallet
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .ok_or((
            Status::BadRequest,
            Json(json!({"error": "wallet query parameter is required"})),
        ))?;
    let bytes = bs58::decode(w).into_vec().map_err(|_| {
        (
            Status::BadRequest,
            Json(json!({"error": "wallet is not valid base58"})),
        )
    })?;
    if bytes.len() != 32 {
        return Err((
            Status::BadRequest,
            Json(json!({"error": "wallet must be a valid 32-byte public key (base58)"})),
        ));
    }
    Ok(w)
}
