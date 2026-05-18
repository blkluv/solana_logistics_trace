use async_trait::async_trait;
use serde_json::json;

use super::IncidentRule;
use crate::incident_engine::models::{IncidentDetectionResult, ShipmentContext, TelemetryEvent};

pub struct ColdChainRule;

const MAX_TEMP_C: f64 = 8.0;

#[async_trait]
impl IncidentRule for ColdChainRule {
    fn name(&self) -> &'static str {
        "cold_chain_limit"
    }

    async fn evaluate_telemetry(
        &self,
        telemetry: &TelemetryEvent,
        shipment: &ShipmentContext,
    ) -> Option<IncidentDetectionResult> {
        if !shipment.requires_cold_chain || telemetry.telemetry_type != "temperature" {
            return None;
        }
        let temp = telemetry.value_numeric?;
        if temp <= MAX_TEMP_C {
            return None;
        }
        Some(IncidentDetectionResult {
            incident_type: "COLD_CHAIN_BROKEN".into(),
            severity: "High".into(),
            description: format!("Temperature {temp}°C exceeds limit {MAX_TEMP_C}°C"),
            evidence_json: json!({
                "temperature": temp,
                "threshold": MAX_TEMP_C,
                "shipment_id": shipment.shipment_id.to_string(),
            }),
            rule_name: self.name().into(),
        })
    }

    async fn evaluate_shipment(
        &self,
        _shipment: &ShipmentContext,
    ) -> Option<IncidentDetectionResult> {
        None
    }
}
