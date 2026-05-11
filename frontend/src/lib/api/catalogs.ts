/**
 * Cliente GET hacia `/api/v1/catalogs/*` (filas `cat_*` en Postgres).
 */

import {
    mapActorCatalogToOptions,
    mapCheckpointCatalogToOptions,
    type CatalogOptionRow,
} from "@/lib/solana/catalogCodeMap";
import type { ActorRoleCode, CheckpointTypeCode } from "@/lib/solana/ix";

function joinBase(apiBaseUrl: string, pathSegment: string): string {
    const base = apiBaseUrl.replace(/\/+$/, "");
    const path = pathSegment.replace(/^\/+/, "");
    return `${base}/${path}`;
}

export type CatalogApiItem = {
    code: string;
    label: string;
    description: string | null;
    sort_order: number;
};

export function parseCatalogApiResponse(json: unknown): CatalogApiItem[] {
    if (!Array.isArray(json)) {
        throw new Error("respuesta de catálogo: se esperaba un arreglo JSON");
    }
    const out: CatalogApiItem[] = [];
    for (const el of json) {
        if (typeof el !== "object" || el === null) {
            continue;
        }
        const o = el as Record<string, unknown>;
        const code = typeof o.code === "string" ? o.code.trim() : "";
        const label = typeof o.label === "string" ? o.label.trim() : "";
        if (!code || !label) {
            continue;
        }
        const description =
            o.description === null || o.description === undefined
                ? null
                : String(o.description);
        const sortOrderRaw = o.sort_order;
        const sort_order =
            typeof sortOrderRaw === "number" && Number.isFinite(sortOrderRaw)
                ? sortOrderRaw
                : Number.parseInt(String(sortOrderRaw ?? 0), 10) || 0;
        out.push({ code, label, description, sort_order });
    }
    return out;
}

async function getJsonCatalog(
    apiBaseUrl: string,
    pathSegment: string,
    signal?: AbortSignal,
): Promise<CatalogApiItem[]> {
    const url = joinBase(apiBaseUrl, pathSegment);
    const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal,
    });
    if (!res.ok) {
        throw new Error(`${pathSegment} → HTTP ${res.status}`);
    }
    const json: unknown = await res.json();
    return parseCatalogApiResponse(json);
}

export async function fetchActorRolesCatalog(
    apiBaseUrl: string,
    signal?: AbortSignal,
): Promise<CatalogApiItem[]> {
    return getJsonCatalog(apiBaseUrl, "catalogs/actor-roles", signal);
}

export async function fetchCheckpointTypesCatalog(
    apiBaseUrl: string,
    signal?: AbortSignal,
): Promise<CatalogApiItem[]> {
    return getJsonCatalog(apiBaseUrl, "catalogs/checkpoint-types", signal);
}

export async function loadActorRoleSelectOptions(
    apiBaseUrl: string,
    onUnknownCode?: (code: string) => void,
    signal?: AbortSignal,
): Promise<CatalogOptionRow<ActorRoleCode>[]> {
    const raw = await fetchActorRolesCatalog(apiBaseUrl, signal);
    return mapActorCatalogToOptions(raw, onUnknownCode);
}

export async function loadCheckpointSelectOptions(
    apiBaseUrl: string,
    onUnknownCode?: (code: string) => void,
    signal?: AbortSignal,
): Promise<CatalogOptionRow<CheckpointTypeCode>[]> {
    const raw = await fetchCheckpointTypesCatalog(apiBaseUrl, signal);
    return mapCheckpointCatalogToOptions(raw, onUnknownCode);
}
