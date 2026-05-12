use anchor_lang::prelude::*;

use crate::{
    constants::SHIPMENT_SEED,
    error::ErrorCode,
    events::ShipmentCancelled,
    state::{Shipment, ShipmentStatus},
};

#[derive(Accounts)]
pub struct CancelShipment<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(
        mut,
        seeds = [SHIPMENT_SEED, &shipment.id.to_le_bytes()],
        bump,
        constraint = shipment.sender == sender.key() @ ErrorCode::UnauthorizedSender
    )]
    pub shipment: Account<'info, Shipment>,
}

pub fn process_cancel_shipment(ctx: Context<CancelShipment>) -> Result<()> {
    let shipment = &mut ctx.accounts.shipment;
    require!(
        shipment.status != ShipmentStatus::Delivered
            && shipment.status != ShipmentStatus::Cancelled,
        ErrorCode::ShipmentAlreadyClosed
    );

    shipment.status = ShipmentStatus::Cancelled;

    emit!(ShipmentCancelled {
        on_chain_shipment_id: shipment.id,
        cancelled_by: ctx.accounts.sender.key(),
    });

    Ok(())
}
