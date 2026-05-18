//! Evalúa reglas contra telemetría y contexto de envío.

use sqlx::PgPool;

use crate::incident_engine::models::TelemetryEvent;
use crate::incident_engine::processors::IncidentProcessor;
use crate::incident_engine::rules::{all_rules, evaluate_offline};
use crate::incident_engine::repositories::incidents;

pub struct RuleEngineService;

impl RuleEngineService {
    pub async fn process_telemetry(
        pool: &PgPool,
        telemetry: TelemetryEvent,
    ) -> Result<(), sqlx::Error> {
        let Some(shipment) = incidents::load_shipment_context(pool, telemetry.shipment_id).await?
        else {
            return Ok(());
        };

        for rule in all_rules() {
            if let Some(detection) = rule.evaluate_telemetry(&telemetry, &shipment).await {
                IncidentProcessor::apply_detection(pool, shipment.shipment_id, detection).await?;
            }
        }
        Ok(())
    }

    pub async fn scan_shipment(
        pool: &PgPool,
        shipment_id: uuid::Uuid,
    ) -> Result<(), sqlx::Error> {
        let Some(shipment) = incidents::load_shipment_context(pool, shipment_id).await? else {
            return Ok(());
        };

        for rule in all_rules() {
            if let Some(detection) = rule.evaluate_shipment(&shipment).await {
                IncidentProcessor::apply_detection(pool, shipment.shipment_id, detection).await?;
            }
        }

        if let Some(detection) = evaluate_offline(pool, &shipment).await {
            IncidentProcessor::apply_detection(pool, shipment.shipment_id, detection).await?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use chrono::Utc;
    use uuid::Uuid;

    use super::*;
    use crate::incident_engine::models::ShipmentContext;
    use crate::incident_engine::rules::{ColdChainRule, IncidentRule};

    #[tokio::test]
    async fn cold_chain_rule_triggers_above_threshold() {
        let rule = ColdChainRule;
        let shipment = ShipmentContext {
            shipment_id: Uuid::new_v4(),
            requires_cold_chain: true,
            origin: "13.5,-89.2".into(),
            destination: "13.4,-89.0".into(),
            last_checkpoint_at: None,
        };
        let telemetry = TelemetryEvent {
            shipment_id: shipment.shipment_id,
            telemetry_type: "temperature".into(),
            value_numeric: Some(12.0),
            latitude: None,
            longitude: None,
            metadata_json: None,
            recorded_at: Utc::now(),
        };
        let detection = rule.evaluate_telemetry(&telemetry, &shipment).await;
        assert!(detection.is_some());
        assert_eq!(detection.unwrap().incident_type, "COLD_CHAIN_BROKEN");
    }
}
