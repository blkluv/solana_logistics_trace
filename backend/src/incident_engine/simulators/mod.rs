//! Simuladores IoT para envíos con monitoreo activo.

use chrono::Utc;
use rand::Rng;
use sqlx::PgPool;
use uuid::Uuid;

use crate::incident_engine::models::TelemetryEvent;
use crate::incident_engine::repositories::{incidents, monitoring, telemetry};
use crate::incident_engine::services::rule_engine_service::RuleEngineService;

pub async fn simulate_temperature_for_shipment(
    pool: &PgPool,
    shipment_id: Uuid,
) -> Result<(), sqlx::Error> {
    if !monitoring::is_active(pool, shipment_id).await? {
        return Ok(());
    }

    let requires_cold = incidents::load_shipment_context(pool, shipment_id)
        .await?
        .map(|s| s.requires_cold_chain)
        .unwrap_or(false);

    let temp = {
        let mut rng = rand::thread_rng();
        if requires_cold {
            rng.gen_range(2.0..12.0)
        } else {
            rng.gen_range(15.0..28.0)
        }
    };

    let event = TelemetryEvent {
        shipment_id,
        telemetry_type: "temperature".into(),
        value_numeric: Some(temp),
        latitude: None,
        longitude: None,
        metadata_json: None,
        recorded_at: Utc::now(),
    };

    telemetry::insert(pool, &event).await?;
    RuleEngineService::process_telemetry(pool, event).await
}

pub async fn simulate_gps_for_shipment(
    pool: &PgPool,
    shipment_id: Uuid,
) -> Result<(), sqlx::Error> {
    if !monitoring::is_active(pool, shipment_id).await? {
        return Ok(());
    }

    let ctx = incidents::load_shipment_context(pool, shipment_id).await?;
    let Some(ctx) = ctx else {
        return Ok(());
    };

    let (lat, lng) = {
        let mut rng = rand::thread_rng();
        let base_lat = 13.70;
        let base_lng = -89.20;
        (
            base_lat + rng.gen_range(-0.15..0.15),
            base_lng + rng.gen_range(-0.15..0.15),
        )
    };

    let event = TelemetryEvent {
        shipment_id,
        telemetry_type: "gps".into(),
        value_numeric: None,
        latitude: Some(lat),
        longitude: Some(lng),
        metadata_json: None,
        recorded_at: Utc::now(),
    };

    telemetry::insert(pool, &event).await?;
    let _ = ctx;
    RuleEngineService::process_telemetry(pool, event).await
}
