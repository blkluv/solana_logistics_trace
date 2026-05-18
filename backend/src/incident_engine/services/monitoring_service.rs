//! Arranque/parada de monitoreo por envío (UUID).

use sqlx::PgPool;
use uuid::Uuid;

use crate::incident_engine::repositories::monitoring;

pub struct MonitoringService;

impl MonitoringService {
    pub async fn start(pool: &PgPool, shipment_id: Uuid) -> Result<(), sqlx::Error> {
        monitoring::start_monitoring(pool, shipment_id).await
    }

    pub async fn stop(pool: &PgPool, shipment_id: Uuid) -> Result<(), sqlx::Error> {
        monitoring::stop_monitoring(pool, shipment_id).await
    }
}
