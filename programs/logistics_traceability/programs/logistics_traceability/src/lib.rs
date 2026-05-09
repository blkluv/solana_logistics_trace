pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use events::*;
pub use instructions::*;
pub use state::*;

declare_id!("CqNEvq5AtuZH7ffQCrt63m5M9g3MLhsvgVnXYS5fMbEc");

#[program]
pub mod logistics_traceability {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        process_initialize(ctx)
    }

    pub fn register_actor(
        ctx: Context<RegisterActor>,
        role: ActorRole,
        name: String,
        location: String,
    ) -> Result<()> {
        process_register_actor(ctx, role, name, location)
    }

    pub fn create_shipment(
        ctx: Context<CreateShipment>,
        product: String,
        origin: String,
        destination: String,
        requires_cold_chain: bool,
    ) -> Result<()> {
        process_create_shipment(ctx, product, origin, destination, requires_cold_chain)
    }
}
