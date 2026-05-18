//! Modelos del motor de incidencias.

use chrono::{DateTime, Utc};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct TelemetryEvent {
    pub shipment_id: Uuid,
    pub telemetry_type: String,
    pub value_numeric: Option<f64>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub metadata_json: Option<Value>,
    pub recorded_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct ShipmentContext {
    pub shipment_id: Uuid,
    pub requires_cold_chain: bool,
    pub origin: String,
    pub destination: String,
    pub last_checkpoint_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub struct IncidentDetectionResult {
    pub incident_type: String,
    pub severity: String,
    pub description: String,
    pub evidence_json: Value,
    pub rule_name: String,
}
