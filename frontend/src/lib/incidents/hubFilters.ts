import type { IncidentHubRecentItem } from "@/lib/api/incidentsHub";

export type IncidentHubFilters = {
    query: string;
    status: "" | "Open" | "Resolved";
    severity: string;
    source: string;
};

export const EMPTY_INCIDENT_HUB_FILTERS: IncidentHubFilters = {
    query: "",
    status: "",
    severity: "",
    source: "",
};

export function uniqueIncidentSeverities(rows: IncidentHubRecentItem[]): string[] {
    const set = new Set<string>();
    for (const row of rows) {
        set.add(row.severity);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
}

export function uniqueIncidentSources(rows: IncidentHubRecentItem[]): string[] {
    const set = new Set<string>();
    for (const row of rows) {
        set.add(row.source);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
}

function matchesQuery(row: IncidentHubRecentItem, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) {
        return true;
    }
    const haystack = [
        row.id,
        row.shipmentId,
        row.incidentType,
        row.severity,
        row.status,
        row.source,
        row.description,
        row.shipmentProduct,
        row.shipmentStatus,
        row.ruleName ?? "",
    ]
        .join(" ")
        .toLowerCase();
    return haystack.includes(q);
}

export function filterIncidentHubRecent(
    rows: IncidentHubRecentItem[],
    filters: IncidentHubFilters,
): IncidentHubRecentItem[] {
    return rows.filter((row) => {
        if (filters.status && row.status !== filters.status) {
            return false;
        }
        if (filters.severity && row.severity !== filters.severity) {
            return false;
        }
        if (filters.source && row.source !== filters.source) {
            return false;
        }
        return matchesQuery(row, filters.query);
    });
}
