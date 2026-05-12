//! GET `/api/v1/actors/me` — wallet from query (Etapa 2 §8.2).

use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::serde::Serialize;
use rocket::State;
use serde_json::{json, Value};
use sqlx::PgPool;

use crate::repos::actors;
use crate::wallet_query::{require_wallet_form, WalletQuery};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActorMeJson {
    pub wallet: String,
    pub role: String,
    pub name: String,
    pub location: Option<String>,
    pub registration_tx_hash: String,
}

#[rocket::get("/actors/me?<q..>")]
pub async fn get_actor_me(
    pool: &State<PgPool>,
    q: WalletQuery<'_>,
) -> Result<Json<ActorMeJson>, (Status, Json<Value>)> {
    let w = require_wallet_form(&q)?;
    let row = actors::select_actor_optional(pool.inner(), w)
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
            Json(json!({"error": "actor not found"})),
        )),
        Some((wallet, role, name, location, reg_tx)) => Ok(Json(ActorMeJson {
            wallet,
            role,
            name,
            location,
            registration_tx_hash: reg_tx.unwrap_or_default(),
        })),
    }
}
