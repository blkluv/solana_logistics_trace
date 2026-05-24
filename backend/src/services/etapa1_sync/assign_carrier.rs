use std::sync::Arc;

use sqlx::PgPool;

use super::{
    first_matching_account, optional_carrier_wallet, validate_signature_base58, SyncOutcome,
    SyncRequestBody,
};
use crate::repos::shipments;
use crate::solana::decode::decode_shipment_account;
use crate::solana::discriminators::assign_carrier_ix;
use crate::solana::parse::{find_program_instruction, transaction_result};
use crate::solana::{SolanaRpcClient, SolanaSyncError};

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssignCarrierSyncResponse {
    pub shipment_id: uuid::Uuid,
    pub carrier_wallet: String,
    pub tx_hash: String,
}

pub async fn sync_assign_carrier(
    pool: &PgPool,
    rpc: &Arc<dyn SolanaRpcClient>,
    program_id: &str,
    body: &SyncRequestBody,
) -> Result<SyncOutcome<AssignCarrierSyncResponse>, SolanaSyncError> {
    validate_signature_base58(&body.tx_hash)?;
    let commitment = body.commitment();

    let tx_json = rpc
        .get_transaction_json(&body.tx_hash, &commitment)
        .await
        .map_err(|e| SolanaSyncError::Upstream(e.0))?;

    if transaction_result(&tx_json).is_none() {
        return Err(SolanaSyncError::TxNotFound);
    }

    let (keys, _) = find_program_instruction(&tx_json, program_id, &assign_carrier_ix())?;

    let (_, shipment) =
        first_matching_account(rpc, &keys, &commitment, decode_shipment_account).await?;

    let carrier_wallet = optional_carrier_wallet(&shipment.carrier).ok_or_else(|| {
        SolanaSyncError::Validation("assign_carrier tx did not set carrier".into())
    })?;

    let on_chain_id_i64: i64 = shipment.id.try_into().map_err(|_| {
        SolanaSyncError::Validation("on_chain_shipment_id overflow".into())
    })?;

    let shipment_uuid = shipments::id_by_on_chain_shipment_id(pool, on_chain_id_i64)
        .await
        .map_err(|e| SolanaSyncError::Validation(e.to_string()))?
        .ok_or_else(|| {
            SolanaSyncError::Validation("shipment not found; sync create shipment first".into())
        })?;

    shipments::update_carrier_wallet(pool, shipment_uuid, &carrier_wallet)
        .await
        .map_err(|e| SolanaSyncError::Validation(e.to_string()))?;

    Ok(SyncOutcome {
        created: true,
        body: AssignCarrierSyncResponse {
            shipment_id: shipment_uuid,
            carrier_wallet,
            tx_hash: body.tx_hash.clone(),
        },
    })
}
