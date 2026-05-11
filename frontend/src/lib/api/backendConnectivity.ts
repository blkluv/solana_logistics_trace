/**
 * El backend Rocket monta sync bajo `/api/v1` y `GET /health` en la raíz del mismo host.
 */

const V1_SUFFIX = /\/api\/v1$/i;

export function normalizeApiBaseUrl(raw: string): string {
    return raw.trim().replace(/\/+$/, "");
}

/** true si la base termina en `/api/v1` (recomendado para postShipmentsSync, etc.). */
export function apiBaseHasV1Prefix(apiBaseUrl: string): boolean {
    return V1_SUFFIX.test(normalizeApiBaseUrl(apiBaseUrl));
}

/**
 * `http://host:port/api/v1` → `http://host:port/health`
 * Si no hay cadena, devuelve null.
 */
export function healthCheckUrlFromApiBase(apiBaseUrl: string): string | null {
    const n = normalizeApiBaseUrl(apiBaseUrl);
    if (!n) {
        return null;
    }
    const origin = n.replace(V1_SUFFIX, "");
    const base = origin.replace(/\/+$/, "");
    return `${base}/health`;
}

export type BackendHealthResult =
    | { ok: true; status: number; database?: string }
    | { ok: false; status: number; hint: string };

export async function fetchBackendHealth(
    healthUrl: string,
    signal?: AbortSignal,
): Promise<BackendHealthResult> {
    let res: Response;
    try {
        res = await fetch(healthUrl, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal,
        });
    } catch (e) {
        const msg =
            e instanceof Error
                ? e.message.replace(/^fetch failed.*$/i, "red no alcanzable")
                : String(e);
        const hint =
            msg.includes("AbortError") || msg.includes("aborted")
                ? "tiempo de espera agotado"
                : msg;
        return { ok: false, status: 0, hint };
    }

    const text = await res.text();
    let database: string | undefined;
    if (text) {
        try {
            const j = JSON.parse(text) as { database?: string };
            if (typeof j.database === "string") {
                database = j.database;
            }
        } catch {
            /* no JSON */
        }
    }

    if (!res.ok) {
        return {
            ok: false,
            status: res.status,
            hint: text.slice(0, 200) || `HTTP ${res.status}`,
        };
    }

    return { ok: true, status: res.status, database };
}
