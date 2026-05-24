//! Shipment visibility rules by actor role (Etapa 2 §5, §8.2).

/// Hub and Inspector see the full operational inventory.
pub fn operational_roles_see_all_shipments(role: &str) -> bool {
    matches!(role, "Hub" | "Inspector")
}

#[must_use]
pub fn is_carrier_role(role: &str) -> bool {
    role == "Carrier"
}

#[cfg(test)]
mod tests {
    use super::{is_carrier_role, operational_roles_see_all_shipments};

    #[test]
    fn operational_roles_include_hub_inspector_only() {
        assert!(!operational_roles_see_all_shipments("Carrier"));
        assert!(operational_roles_see_all_shipments("Hub"));
        assert!(operational_roles_see_all_shipments("Inspector"));
    }

    #[test]
    fn participant_roles_do_not_see_all_shipments() {
        assert!(!operational_roles_see_all_shipments("Sender"));
        assert!(!operational_roles_see_all_shipments("Recipient"));
    }

    #[test]
    fn carrier_role_detected() {
        assert!(is_carrier_role("Carrier"));
        assert!(!is_carrier_role("Sender"));
    }
}
