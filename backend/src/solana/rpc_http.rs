use std::sync::Arc;

use async_trait::async_trait;
use base64::Engine;
use serde_json::{json, Value};

use crate::solana::{SolanaRpcClient, SolanaRpcError};

#[derive(Clone)]
pub struct HttpSolanaRpcClient {
    http: Arc<reqwest::Client>,
    rpc_url: Arc<str>,
}

impl HttpSolanaRpcClient {
    pub fn new(rpc_url: impl Into<String>) -> Self {
        Self {
            http: Arc::new(reqwest::Client::new()),
            rpc_url: Arc::from(rpc_url.into()),
        }
    }

    async fn rpc_call(&self, method: &str, params: Value) -> Result<Value, SolanaRpcError> {
        let body = json!({
            "jsonrpc": "2.0",
            "id": 1u64,
            "method": method,
            "params": params,
        });

        let response = self
            .http
            .post(self.rpc_url.as_ref())
            .json(&body)
            .send()
            .await?;

        let parsed: Value = response.json().await?;
        if let Some(err) = parsed.get("error") {
            let msg = err
                .get("message")
                .and_then(|m| m.as_str())
                .unwrap_or("rpc error");
            return Err(SolanaRpcError(msg.to_string()));
        }

        parsed
            .get("result")
            .cloned()
            .ok_or_else(|| SolanaRpcError("missing result".into()))
    }
}

#[async_trait]
impl SolanaRpcClient for HttpSolanaRpcClient {
    async fn get_health(&self) -> Result<String, SolanaRpcError> {
        let result = self.rpc_call("getHealth", json!([])).await?;
        result
            .as_str()
            .map(std::string::ToString::to_string)
            .ok_or_else(|| SolanaRpcError("unexpected getHealth response".into()))
    }

    async fn get_transaction_json(
        &self,
        signature: &str,
        commitment: &str,
    ) -> Result<Value, SolanaRpcError> {
        self.rpc_call(
            "getTransaction",
            json!([
                signature,
                {
                    "encoding": "json",
                    "commitment": commitment,
                    "maxSupportedTransactionVersion": 0
                }
            ]),
        )
        .await
    }

    async fn get_account_data_base64(
        &self,
        pubkey: &str,
        commitment: &str,
    ) -> Result<Option<Vec<u8>>, SolanaRpcError> {
        let result = self
            .rpc_call(
                "getAccountInfo",
                json!([
                    pubkey,
                    { "encoding": "base64", "commitment": commitment }
                ]),
            )
            .await?;

        let value = match result.get("value") {
            None | Some(Value::Null) => return Ok(None),
            Some(v) => v,
        };

        let data_arr = value
            .get("data")
            .and_then(|d| d.as_array())
            .ok_or_else(|| SolanaRpcError("account data missing".into()))?;

        let b64 = data_arr
            .first()
            .and_then(|v| v.as_str())
            .ok_or_else(|| SolanaRpcError("account data encoding unexpected".into()))?;

        let bytes = base64::engine::general_purpose::STANDARD
            .decode(b64)
            .map_err(|e| SolanaRpcError(e.to_string()))?;

        Ok(Some(bytes))
    }
}
