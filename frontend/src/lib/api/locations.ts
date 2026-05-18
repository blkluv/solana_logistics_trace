/**
 * Cliente GET hacia `/api/v1/catalogs/locations` (catálogo de ubicaciones).
 */

export type LocationCatalogItem = {
    code: string;
    label: string;
    description: string;
    facilityType: string;
    facilityTypeLabel: string;
    department: string;
    lat: number;
    lng: number;
    sortOrder: number;
};

export type LocationsGetResult =
    | { ok: true; status: number; data: LocationCatalogItem[] }
    | { ok: false; status: number; body: unknown };

function joinBase(apiBaseUrl: string, pathSegment: string): string {
    const base = apiBaseUrl.replace(/\/+$/, "");
    const path = pathSegment.replace(/^\/+/, "");
    return `${base}/${path}`;
}

function asRecord(v: unknown): Record<string, unknown> | null {
    return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
}

function asString(v: unknown): string {
    return typeof v === "string" ? v.trim() : "";
}

function asNumber(v: unknown): number {
    if (typeof v === "number" && Number.isFinite(v)) {
        return v;
    }
    const n = Number.parseFloat(String(v ?? ""));
    return Number.isFinite(n) ? n : NaN;
}

export function parseLocationCatalogResponse(json: unknown): LocationCatalogItem[] {
    if (!Array.isArray(json)) {
        return [];
    }
    const out: LocationCatalogItem[] = [];
    for (const el of json) {
        const o = asRecord(el);
        if (!o) {
            continue;
        }
        const code = asString(o.code);
        const label = asString(o.label);
        const lat = asNumber(o.lat);
        const lng = asNumber(o.lng);
        if (!code || !label || !Number.isFinite(lat) || !Number.isFinite(lng)) {
            continue;
        }
        out.push({
            code,
            label,
            description: asString(o.description),
            facilityType: asString(o.facilityType),
            facilityTypeLabel: asString(o.facilityTypeLabel),
            department: asString(o.department),
            lat,
            lng,
            sortOrder: Number.isFinite(asNumber(o.sortOrder))
                ? asNumber(o.sortOrder)
                : 0,
        });
    }
    return out;
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

export async function getLocationsCatalog(
    apiBaseUrl: string,
    signal?: AbortSignal,
): Promise<LocationsGetResult> {
    const url = joinBase(apiBaseUrl, "catalogs/locations");
    const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal,
    });
    const body = await parseJson(res);
    if (!res.ok) {
        return { ok: false, status: res.status, body };
    }
    return { ok: true, status: res.status, data: parseLocationCatalogResponse(body) };
}
