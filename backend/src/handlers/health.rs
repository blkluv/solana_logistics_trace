use rocket::{get, serde::json::Json};
use serde::Serialize;

#[derive(Serialize)]
pub struct HealthBody {
    pub status: &'static str,
}

#[get("/health")]
pub fn health() -> Json<HealthBody> {
    Json(HealthBody { status: "ok" })
}
