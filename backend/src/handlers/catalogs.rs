//! GET `/api/v1/catalogs/*` — read-only lists from `cat_*` tables.

use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::State;
use sqlx::PgPool;

use crate::repos::catalogs;

#[rocket::get("/catalogs/actor-roles")]
pub async fn get_actor_roles(
    pool: &State<PgPool>,
) -> Result<Json<Vec<catalogs::CatalogItem>>, Status> {
    catalogs::list_actor_roles(pool.inner())
        .await
        .map(Json)
        .map_err(|_| Status::InternalServerError)
}

#[rocket::get("/catalogs/checkpoint-types")]
pub async fn get_checkpoint_types(
    pool: &State<PgPool>,
) -> Result<Json<Vec<catalogs::CatalogItem>>, Status> {
    catalogs::list_checkpoint_types(pool.inner())
        .await
        .map(Json)
        .map_err(|_| Status::InternalServerError)
}
