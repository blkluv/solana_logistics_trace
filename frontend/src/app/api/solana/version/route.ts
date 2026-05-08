import { NextResponse } from "next/server";

const DEFAULT_RPC = "http://127.0.0.1:8899";

/**
 * Proxies JSON-RPC `getVersion` server-side so the browser never hits the validator
 * cross-origin (Solana RPC does not send CORS headers by default).
 */
export async function GET() {
    const rpcUrl =
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() || DEFAULT_RPC;

    try {
        const res = await fetch(rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getVersion",
            }),
            signal: AbortSignal.timeout(8_000),
        });

        if (!res.ok) {
            return NextResponse.json({
                ok: false,
                hint: `HTTP ${res.status}`,
            });
        }

        const json: unknown = await res.json();
        if (
            typeof json === "object" &&
            json !== null &&
            "error" in json &&
            (json as { error?: { message?: string } }).error
        ) {
            const msg =
                (json as { error?: { message?: string } }).error?.message ??
                "rpc error";
            return NextResponse.json({ ok: false, hint: msg });
        }

        const result = (json as { result?: unknown }).result;
        const solanaCore =
            typeof result === "object" &&
            result !== null &&
            "solana-core" in result
                ? String((result as { "solana-core": string })["solana-core"])
                : JSON.stringify(result ?? "");

        return NextResponse.json({ ok: true, solanaCore });
    } catch (e) {
        const msg =
            e instanceof Error ? e.message.replace(/^fetch failed.*$/i, "unreachable") : "unreachable";
        return NextResponse.json({
            ok: false,
            hint: msg.includes("timeout") || msg.includes("AbortError") ? "timeout" : msg,
        });
    }
}
