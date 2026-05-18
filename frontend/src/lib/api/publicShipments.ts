/**
 * Consulta pública `GET /api/v1/public/shipments/:shipmentId` (solo UUID, sin wallet).
 */

import {
    parseShipmentDetail,
    type ShipmentDetail,
    type ShipmentGetResult,
} from "@/lib/api/shipments";

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function joinBase(apiBaseUrl: string, pathSegment: string): string {
    const base = apiBaseUrl.replace(/\/+$/, "");
    const path = pathSegment.replace(/^\/+/, "");
    return `${base}/${path}`;
}

async function parseJson(res: Response): Promise<unknown> {
    const text = await res.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return text;
    }
}

export function isShipmentServiceUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

export function publicShipmentLookupError(status: number, body: unknown): string {
    if (status === 404) {
        return "No existe un envío con ese UUID de servicio.";
    }
    if (status === 422) {
        return "El identificador no tiene formato UUID válido.";
    }
    if (status === 0) {
        return "No hubo respuesta del servidor. Compruebe que el backend esté en ejecución.";
    }
    if (status >= 500) {
        return "El servicio no está disponible temporalmente. Inténtelo más tarde.";
    }
    if (body && typeof body === "object" && "error" in body) {
        const e = (body as { error: unknown }).error;
        if (typeof e === "string" && e.trim()) {
            return e.trim();
        }
    }
    return `No se pudo consultar el envío (HTTP ${status}).`;
}

export async function getPublicShipmentDetail(
    apiBaseUrl: string,
    shipmentId: string,
    signal?: AbortSignal,
): Promise<ShipmentGetResult<ShipmentDetail>> {
    const id = shipmentId.trim();
    const url = joinBase(apiBaseUrl, `public/shipments/${encodeURIComponent(id)}`);
    const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal,
    });
    const body = await parseJson(res);
    if (!res.ok) {
        return { ok: false, status: res.status, body };
    }
    const detail = parseShipmentDetail(body);
    if (!detail) {
        return { ok: false, status: res.status, body };
    }
    return { ok: true, status: res.status, data: detail };
}
