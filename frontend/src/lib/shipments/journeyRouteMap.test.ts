import { describe, expect, it } from "vitest";

import { resolveJourneyRoutePoints } from "./journeyRouteMap";

const catalog = [
    {
        code: "SV-SSA",
        label: "San Salvador",
        description: "Hub San Salvador",
        facilityType: "hub",
        facilityTypeLabel: "Hub",
        department: "San Salvador",
        lat: 13.7,
        lng: -89.2,
        sortOrder: 1,
    },
];

describe("resolveJourneyRoutePoints", () => {
    it("parses coordinate strings", () => {
        const pts = resolveJourneyRoutePoints(
            "13.70,-89.20",
            "14.10,-88.50",
            [],
            "Origen",
            "Destino",
        );
        expect(pts).toHaveLength(2);
        expect(pts[0]?.role).toBe("origin");
        expect(pts[1]?.lat).toBeCloseTo(14.1, 1);
    });

    it("resolves from catalog when field matches coords", () => {
        const pts = resolveJourneyRoutePoints(
            "13.70,-89.20",
            "13.70,-89.20",
            catalog,
            "O",
            "D",
        );
        expect(pts).toHaveLength(2);
    });

    it("returns empty when no coords", () => {
        expect(resolveJourneyRoutePoints("texto", "otro", [], "O", "D")).toEqual([]);
    });
});
