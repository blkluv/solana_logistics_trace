pub mod rpc_http;

use async_trait::async_trait;

/// Transport or JSON-RPC level failure surfaced to handlers.
#[derive(Debug, Clone)]
pub struct SolanaRpcError(pub String);

impl std::fmt::Display for SolanaRpcError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for SolanaRpcError {}

impl From<reqwest::Error> for SolanaRpcError {
    fn from(value: reqwest::Error) -> Self {
        SolanaRpcError(value.to_string())
    }
}

/// Abstracts read-only RPC calls used by the API (implementations must remain non-signing).
#[async_trait]
pub trait SolanaRpcClient: Send + Sync {
    /// JSON-RPC [`getHealth`](https://solana.com/docs/rpc/http/gethealth) result (`"ok"` when healthy).
    async fn get_health(&self) -> Result<String, SolanaRpcError>;
}
