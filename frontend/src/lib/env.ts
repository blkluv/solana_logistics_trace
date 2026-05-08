/**
 * Reads public env vars inlined at build time (see root `.env.example` `NEXT_PUBLIC_*`).
 */
export function getPublicConfig() {
    return {
        network: process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "localnet",
        rpcUrl:
            process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "http://127.0.0.1:8899",
        programId: process.env.NEXT_PUBLIC_PROGRAM_ID ?? "",
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
    } as const;
}
