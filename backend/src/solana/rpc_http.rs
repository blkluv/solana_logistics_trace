use std::sync::Arc;

use async_trait::async_trait;
use serde::Deserialize;

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
}

#[derive(Debug, Deserialize)]
struct JsonRpcEnvelope {
    #[allow(dead_code)]
    pub jsonrpc: Option<String>,
    pub result: Option<String>,
    pub error: Option<JsonRpcError>,
}

#[derive(Debug, Deserialize)]
struct JsonRpcError {
    pub message: Option<String>,
}

#[async_trait]
impl SolanaRpcClient for HttpSolanaRpcClient {
    async fn get_health(&self) -> Result<String, SolanaRpcError> {
        let body = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1u64,
            "method": "getHealth",
        });

        let response = self
            .http
            .post(self.rpc_url.as_ref())
            .json(&body)
            .send()
            .await?;

        let parsed: JsonRpcEnvelope = response.json().await?;
        if let Some(err) = parsed.error {
            let msg = err.message.unwrap_or_else(|| "rpc error".into());
            return Err(SolanaRpcError(msg));
        }

        Ok(parsed.result.unwrap_or_default())
    }
}
