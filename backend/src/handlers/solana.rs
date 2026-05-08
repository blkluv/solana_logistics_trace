use std::sync::Arc;

use rocket::{get, http::Status, serde::json::Json, State};
use serde::Serialize;

use crate::solana::SolanaRpcClient;

#[derive(Serialize)]
pub struct SolanaHealthBody {
    pub rpc_health: String,
}

#[get("/solana/health")]
pub async fn solana_health_rpc(rpc: &State<Arc<dyn SolanaRpcClient>>) -> Result<Json<SolanaHealthBody>, Status> {
    match rpc.get_health().await {
        Ok(h) => Ok(Json(SolanaHealthBody {
            rpc_health: h,
        })),
        Err(_) => Err(Status::BadGateway),
    }
}
