import { describe, expect, it } from "vitest";

import type { IncidentHubRecentItem } from "@/lib/api/incidentsHub";
import { filterIncidentHubRecent } from "./hubFilters";

const row = (overrides: Partial<IncidentHubRecentItem>): IncidentHubRecentItem => ({
    id: "inc-1",
    shipmentId: "ship-1",
    incidentType: "COLD_CHAIN_BROKEN",
    severity: "High",
    status: "Open",
    source: "auto",
    description: "Alerta temperatura",
    detectedAt: "2026-05-17T12:00:00Z",
    resolvedAt: null,
    ruleName: "cold_chain_max",
    txHash: null,
    shipmentProduct: "Vacunas",
    shipmentStatus: "InTransit",
    ...overrides,
});

describe("filterIncidentHubRecent", () => {
    it("filters by status and query", () => {
        const rows = [
            row({ id: "a", status: "Open", description: "frío" }),
            row({ id: "b", status: "Resolved", description: "ok" }),
        ];
        const out = filterIncidentHubRecent(rows, {
            query: "frío",
            status: "Open",
            severity: "",
            source: "",
        });
        expect(out).toHaveLength(1);
        expect(out[0]?.id).toBe("a");
    });
});
