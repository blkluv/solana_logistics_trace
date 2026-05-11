//! Read-only catalog rows (`cat_*` tables, Etapa 1).

use serde::Serialize;
use sqlx::PgPool;
use sqlx::Row;

#[derive(Debug, Clone, Serialize)]
pub struct CatalogItem {
    pub code: String,
    pub label: String,
    pub description: Option<String>,
    pub sort_order: i16,
}

fn row_to_item(row: &sqlx::postgres::PgRow) -> Result<CatalogItem, sqlx::Error> {
    Ok(CatalogItem {
        code: row.try_get("code")?,
        label: row.try_get("label")?,
        description: row.try_get("description")?,
        sort_order: row.try_get("sort_order")?,
    })
}

async fn fetch_catalog(
    pool: &PgPool,
    sql: &'static str,
) -> Result<Vec<CatalogItem>, sqlx::Error> {
    let rows = sqlx::query(sql).fetch_all(pool).await?;
    let mut out = Vec::with_capacity(rows.len());
    for r in &rows {
        out.push(row_to_item(r)?);
    }
    Ok(out)
}

pub async fn list_actor_roles(pool: &PgPool) -> Result<Vec<CatalogItem>, sqlx::Error> {
    fetch_catalog(
        pool,
        r#"
        SELECT code, label, description, sort_order
        FROM cat_actor_role
        WHERE is_active = true
        ORDER BY sort_order, code
        "#,
    )
    .await
}

pub async fn list_checkpoint_types(pool: &PgPool) -> Result<Vec<CatalogItem>, sqlx::Error> {
    fetch_catalog(
        pool,
        r#"
        SELECT code, label, description, sort_order
        FROM cat_checkpoint_type
        WHERE is_active = true
        ORDER BY sort_order, code
        "#,
    )
    .await
}
