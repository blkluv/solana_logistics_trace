/**
 * Cliente GET hacia `/api/v1/incidents/hub`.
 */

import { parseIncidentItem, type IncidentItem } from "@/lib/api/incidents";

export type IncidentHubSummary = {
    totalIncidents: number;
    openIncidents: number;
    resolvedIncidents: number;
    criticalOpen: number;
    highOpen: number;
    autoDetections: number;
    onChainReports: number;
    shipmentsWithIncidents: number;
    activeMonitoring: number;
};

export type IncidentHubRecentItem = IncidentItem & {
    shipmentProduct: string;
    shipmentStatus: string;
};

export type IncidentHubData = {
    summary: IncidentHubSummary;
    recent: IncidentHubRecentItem[];
};

export type IncidentHubGetResult =
    | { ok: true; status: number; data: IncidentHubData }
    | { ok: false; status: number; body: unknown };

function joinBase(apiBaseUrl: string, pathSegment: string): string {
    const base = apiBaseUrl.replace(/\/+$/, "");
    const path = pathSegment.replace(/^\/+/, "");
    return `${base}/${path}`;
}

function asRecord(v: unknown): Record<string, unknown> | null {
    return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
}

function asNum(v: unknown): number | null {
    return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function asString(v: unknown): string {
    return typeof v === "string" ? v : "";
}

export function parseIncidentHubSummary(raw: unknown): IncidentHubSummary | null {
    const o = asRecord(raw);
    if (!o) {
        return null;
    }
    const totalIncidents = asNum(o.totalIncidents);
    const openIncidents = asNum(o.openIncidents);
    const resolvedIncidents = asNum(o.resolvedIncidents);
    const criticalOpen = asNum(o.criticalOpen);
    const highOpen = asNum(o.highOpen);
    const autoDetections = asNum(o.autoDetections);
    const onChainReports = asNum(o.onChainReports);
    const shipmentsWithIncidents = asNum(o.shipmentsWithIncidents);
    const activeMonitoring = asNum(o.activeMonitoring);
    if (
        totalIncidents === null ||
        openIncidents === null ||
        resolvedIncidents === null ||
        criticalOpen === null ||
        highOpen === null ||
        autoDetections === null ||
        onChainReports === null ||
        shipmentsWithIncidents === null ||
        activeMonitoring === null
    ) {
        return null;
    }
    return {
        totalIncidents,
        openIncidents,
        resolvedIncidents,
        criticalOpen,
        highOpen,
        autoDetections,
        onChainReports,
        shipmentsWithIncidents,
        activeMonitoring,
    };
}

export function parseIncidentHubRecentItem(raw: unknown): IncidentHubRecentItem | null {
    const incident = parseIncidentItem(raw);
    if (!incident) {
        return null;
    }
    const o = asRecord(raw);
    const shipmentProduct = asString(o?.shipmentProduct);
    const shipmentStatus = asString(o?.shipmentStatus);
    if (!shipmentProduct || !shipmentStatus) {
        return null;
    }
    return { ...incident, shipmentProduct, shipmentStatus };
}

export function parseIncidentHubData(raw: unknown): IncidentHubData | null {
    const o = asRecord(raw);
    if (!o) {
        return null;
    }
    const summary = parseIncidentHubSummary(o.summary);
    if (!summary) {
        return null;
    }
    const recentRaw = Array.isArray(o.recent) ? o.recent : [];
    const recent: IncidentHubRecentItem[] = [];
    for (const el of recentRaw) {
        const item = parseIncidentHubRecentItem(el);
        if (item) {
            recent.push(item);
        }
    }
    return { summary, recent };
}

export async function getIncidentsHub(
    apiBaseUrl: string,
    wallet: string,
    signal?: AbortSignal,
): Promise<IncidentHubGetResult> {
    const url = `${joinBase(apiBaseUrl, "incidents/hub")}?wallet=${encodeURIComponent(wallet)}`;
    const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal,
    });
    const text = await res.text();
    let body: unknown = null;
    if (text) {
        try {
            body = JSON.parse(text) as unknown;
        } catch {
            body = text;
        }
    }
    if (!res.ok) {
        return { ok: false, status: res.status, body };
    }
    const data = parseIncidentHubData(body);
    if (!data) {
        return { ok: false, status: res.status, body };
    }
    return { ok: true, status: res.status, data };
}
