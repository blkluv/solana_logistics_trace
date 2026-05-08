//! Checkpoint-driven shipment status transitions (PLAN §4 — subset MVP).

#[must_use]
pub fn next_status_after_checkpoint(current_status: &str, checkpoint_type: &str) -> Option<&'static str> {
    match (current_status, checkpoint_type) {
        ("Created", "Pickup") => Some("InTransit"),
        ("InTransit", "HubIn") => Some("AtHub"),
        ("AtHub", "HubOut") => Some("InTransit"),
        ("InTransit", "Transit") => Some("OutForDelivery"),
        ("OutForDelivery", "Delivered") => Some("Delivered"),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pickup_moves_created_to_in_transit() {
        assert_eq!(
            next_status_after_checkpoint("Created", "Pickup"),
            Some("InTransit")
        );
    }
}
