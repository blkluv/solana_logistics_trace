import { describe, expect, it } from "vitest";

import { parseIncidentHubData, parseIncidentHubSummary } from "./incidentsHub";

describe("incidentsHub API client", () => {
    it("parses hub summary", () => {
        const summary = parseIncidentHubSummary({
            totalIncidents: 10,
            openIncidents: 4,
            resolvedIncidents: 6,
            criticalOpen: 1,
            highOpen: 2,
            autoDetections: 7,
            onChainReports: 3,
            shipmentsWithIncidents: 2,
            activeMonitoring: 5,
        });
        expect(summary?.openIncidents).toBe(4);
        expect(summary?.criticalOpen).toBe(1);
    });

    it("parses hub payload with recent incidents", () => {
        const data = parseIncidentHubData({
            summary: {
                totalIncidents: 1,
                openIncidents: 1,
                resolvedIncidents: 0,
                criticalOpen: 0,
                highOpen: 1,
                autoDetections: 1,
                onChainReports: 0,
                shipmentsWithIncidents: 1,
                activeMonitoring: 1,
            },
            recent: [
                {
                    id: "inc-1",
                    shipmentId: "ship-1",
                    incidentType: "COLD_CHAIN_BROKEN",
                    severity: "High",
                    status: "Open",
                    source: "auto",
                    description: "Temp alta",
                    detectedAt: "2026-05-17T12:00:00Z",
                    resolvedAt: null,
                    ruleName: "cold_chain_max",
                    txHash: null,
                    shipmentProduct: "Vacunas",
                    shipmentStatus: "InTransit",
                },
            ],
        });
        expect(data?.recent).toHaveLength(1);
        expect(data?.recent[0]?.shipmentProduct).toBe("Vacunas");
    });
});
