use std::sync::Arc;

use chrono::{TimeZone, Utc};
use sqlx::PgPool;

use super::{
    actor_role_code, first_matching_account, load_actor_response, pubkey_bs58,
    validate_signature_base58, ActorSyncResponse, SyncOutcome, SyncRequestBody,
};
use crate::repos::actors;
use crate::solana::decode::decode_actor_account;
use crate::solana::discriminators::register_actor_ix;
use crate::solana::parse::{find_program_instruction, transaction_result};
use crate::solana::{SolanaRpcClient, SolanaSyncError};

pub async fn sync_actor(
    pool: &PgPool,
    rpc: &Arc<dyn SolanaRpcClient>,
    program_id: &str,
    body: &SyncRequestBody,
) -> Result<SyncOutcome<ActorSyncResponse>, SolanaSyncError> {
    validate_signature_base58(&body.tx_hash)?;
    let commitment = body.commitment();

    let tx_json = rpc
        .get_transaction_json(&body.tx_hash, &commitment)
        .await
        .map_err(|e| SolanaSyncError::Upstream(e.0))?;

    if transaction_result(&tx_json).is_none() {
        return Err(SolanaSyncError::TxNotFound);
    }

    let (keys, _data) =
        find_program_instruction(&tx_json, program_id, &register_actor_ix())?;

    let (_, actor) = first_matching_account(rpc, &keys, &commitment, decode_actor_account).await?;
    let wallet = pubkey_bs58(&actor.wallet);
    let role = actor_role_code(actor.role);

    if let Some(ref w) = actors::wallet_by_registration_tx_hash(pool, &body.tx_hash)
        .await
        .map_err(|e| SolanaSyncError::Validation(e.to_string()))?
    {
        let resp = load_actor_response(pool, w, &body.tx_hash)
            .await
            .map_err(|e| SolanaSyncError::Validation(e.to_string()))?;
        return Ok(SyncOutcome {
            created: false,
            body: resp,
        });
    }

    if actors::wallet_exists_for_wallet(pool, &wallet)
        .await
        .map_err(|e| SolanaSyncError::Validation(e.to_string()))?
        .is_some()
    {
        return Err(SolanaSyncError::Conflict(
            "actor wallet already registered with a different transaction".into(),
        ));
    }

    let created_at = Utc
        .timestamp_opt(actor.created_at, 0)
        .single()
        .unwrap_or_else(Utc::now);

    actors::insert_actor(
        pool,
        &wallet,
        role,
        &actor.name,
        actor.location.as_ref(),
        actor.is_active,
        actor.shipments_created as i32,
        actor.checkpoints_recorded as i32,
        created_at,
        &body.tx_hash,
    )
    .await
    .map_err(|e| SolanaSyncError::Validation(e.to_string()))?;

    Ok(SyncOutcome {
        created: true,
        body: ActorSyncResponse {
            wallet,
            role: role.to_string(),
            name: actor.name,
            location: actor.location,
            registration_tx_hash: body.tx_hash.clone(),
        },
    })
}
