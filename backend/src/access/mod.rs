//! Reglas de visibilidad de envíos por rol (Etapa 2 §5, §8.2).

/// Carrier, Hub e Inspector consultan el inventario operativo (sin asignación on-chain en MVP).
pub fn operational_roles_see_all_shipments(role: &str) -> bool {
    matches!(role, "Carrier" | "Hub" | "Inspector")
}

#[cfg(test)]
mod tests {
    use super::operational_roles_see_all_shipments;

    #[test]
    fn operational_roles_include_carrier_hub_inspector() {
        assert!(operational_roles_see_all_shipments("Carrier"));
        assert!(operational_roles_see_all_shipments("Hub"));
        assert!(operational_roles_see_all_shipments("Inspector"));
    }

    #[test]
    fn participant_roles_do_not_see_all_shipments() {
        assert!(!operational_roles_see_all_shipments("Sender"));
        assert!(!operational_roles_see_all_shipments("Recipient"));
    }
}
