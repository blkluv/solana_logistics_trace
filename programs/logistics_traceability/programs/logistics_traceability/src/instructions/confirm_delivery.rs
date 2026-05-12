use anchor_lang::prelude::*;

use crate::{
    constants::SHIPMENT_SEED,
    error::ErrorCode,
    events::DeliveryConfirmed,
    state::{Shipment, ShipmentStatus},
};

#[derive(Accounts)]
pub struct ConfirmDelivery<'info> {
    #[account(mut)]
    pub recipient: Signer<'info>,
    #[account(
        mut,
        seeds = [SHIPMENT_SEED, &shipment.id.to_le_bytes()],
        bump,
        constraint = shipment.recipient == recipient.key() @ ErrorCode::UnauthorizedRecipient
    )]
    pub shipment: Account<'info, Shipment>,
}

pub fn process_confirm_delivery(ctx: Context<ConfirmDelivery>) -> Result<()> {
    let shipment = &mut ctx.accounts.shipment;
    require!(
        shipment.status == ShipmentStatus::OutForDelivery,
        ErrorCode::InvalidShipmentStatusForConfirm
    );

    let now = Clock::get()?.unix_timestamp;
    shipment.status = ShipmentStatus::Delivered;
    shipment.date_delivered = now;

    emit!(DeliveryConfirmed {
        on_chain_shipment_id: shipment.id,
        recipient: ctx.accounts.recipient.key(),
    });

    Ok(())
}
