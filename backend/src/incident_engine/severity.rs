//! Niveles de severidad del motor y resolución desde `incident_rules`.

use std::collections::HashMap;

pub const CRITICAL: &str = "Critical";
pub const HIGH: &str = "High";
pub const MEDIUM: &str = "Medium";
pub const LOW: &str = "Low";

const VALID_LEVELS: &[&str] = &[CRITICAL, HIGH, MEDIUM, LOW];

/// Severidad por defecto si la regla no está en BD o el valor no es válido.
pub fn default_for_rule(rule_name: &str) -> &'static str {
    match rule_name {
        "cold_chain_limit" => CRITICAL,
        "humidity_limit" => HIGH,
        "shipment_delay" => HIGH,
        "route_deviation" => HIGH,
        "sensor_offline" => MEDIUM,
        _ => MEDIUM,
    }
}

pub fn is_valid(level: &str) -> bool {
    VALID_LEVELS.contains(&level)
}

/// Aplica severidad configurada en BD o el valor por defecto del catálogo MVP.
pub fn resolve_for_rule(configured: &HashMap<String, String>, rule_name: &str) -> String {
    configured
        .get(rule_name)
        .map(String::as_str)
        .filter(|s| is_valid(s))
        .unwrap_or_else(|| default_for_rule(rule_name))
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cold_chain_defaults_to_critical() {
        assert_eq!(default_for_rule("cold_chain_limit"), CRITICAL);
    }

    #[test]
    fn resolve_prefers_db_over_default() {
        let mut map = HashMap::new();
        map.insert("cold_chain_limit".into(), MEDIUM.into());
        assert_eq!(resolve_for_rule(&map, "cold_chain_limit"), MEDIUM);
    }

    #[test]
    fn resolve_ignores_invalid_db_values() {
        let mut map = HashMap::new();
        map.insert("sensor_offline".into(), "Urgent".into());
        assert_eq!(resolve_for_rule(&map, "sensor_offline"), MEDIUM);
    }
}
