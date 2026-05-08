pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("CqNEvq5AtuZH7ffQCrt63m5M9g3MLhsvgVnXYS5fMbEc");

#[program]
pub mod logistics_traceability {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
