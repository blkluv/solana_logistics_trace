import type { SyncCallResult } from "@/lib/api/sync";

const DEFAULT_ATTEMPTS = 6;
const DEFAULT_DELAY_MS = 750;

function isTxNotFound(result: SyncCallResult): boolean {
    if (result.status === 404) {
        return true;
    }
    const json = result.json;
    if (json && typeof json === "object" && "error" in json) {
        const err = String((json as { error: unknown }).error);
        return /tx not found|transaction not found/i.test(err);
    }
    return false;
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/** Reintenta sync tras firmar: el RPC puede tardar en indexar la transacción. */
export async function postSyncWithRetry(
    call: () => Promise<SyncCallResult>,
    options?: { maxAttempts?: number; initialDelayMs?: number },
): Promise<SyncCallResult> {
    const maxAttempts = options?.maxAttempts ?? DEFAULT_ATTEMPTS;
    const initialDelayMs = options?.initialDelayMs ?? DEFAULT_DELAY_MS;

    let last: SyncCallResult = { ok: false, status: 0, json: null };
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        last = await call();
        if (last.ok || !isTxNotFound(last)) {
            return last;
        }
        if (attempt < maxAttempts - 1) {
            await delay(initialDelayMs * (attempt + 1));
        }
    }
    return last;
}
