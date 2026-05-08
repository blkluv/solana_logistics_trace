use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ProgramConfig {
    pub authority: Pubkey,
    pub actors_registered: u64,
    pub shipments_created: u64,
    pub checkpoints_recorded: u64,
    pub incidents_reported: u64,
}
