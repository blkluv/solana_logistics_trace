//! Shallow snake_case → camelCase for known checkpoint metadata keys (PLAN §19.3).

use serde_json::{Map, Value};

#[must_use]
pub fn checkpoint_metadata_for_api(metadata: &Value) -> Value {
    let Value::Object(map) = metadata else {
        return if metadata.is_null() {
            Value::Object(Map::new())
        } else {
            metadata.clone()
        };
    };
    let mut out = Map::with_capacity(map.len());
    for (k, v) in map {
        let key = match k.as_str() {
            "scanned_by" => "scannedBy",
            "package_condition" => "packageCondition",
            "hub_warehouse" => "hubWarehouse",
            "operator" => "operator",
            other => other,
        };
        out.insert(key.to_string(), v.clone());
    }
    Value::Object(out)
}
