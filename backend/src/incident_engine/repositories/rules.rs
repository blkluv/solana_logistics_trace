//! Lectura de reglas activas del motor (`incident_rules`).

use std::collections::HashMap;

use sqlx::PgPool;

pub async fn active_severities_by_rule(pool: &PgPool) -> Result<HashMap<String, String>, sqlx::Error> {
    let rows: Vec<(String, String)> = sqlx::query_as(
        r#"SELECT rule_name, severity FROM incident_rules WHERE is_active = true"#,
    )
    .fetch_all(pool)
    .await?;

    Ok(rows.into_iter().collect())
}
