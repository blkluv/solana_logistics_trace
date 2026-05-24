import { describe, expect, it } from "vitest";

import type { IncidentItem } from "@/lib/api/incidents";
import {
    canAnchorAutoIncident,
    mapAutoIncidentToOnChainType,
} from "@/lib/incidents/anchorOnChain";
import { CriticalIncidentTypeCode } from "@/lib/solana/ix";

const base: IncidentItem = {
    id: "id-1",
    shipmentId: "ship-1",
    incidentType: "COLD_CHAIN_BROKEN",
    severity: "Critical",
    status: "Open",
    source: "auto",
    description: "Temp alta",
    detectedAt: "2026-01-01T00:00:00Z",
    resolvedAt: null,
    ruleName: "cold_chain",
    txHash: null,
    evidenceJson: { temperature: 12 },
};

describe("anchorOnChain", () => {
    it("allows anchoring open auto critical without tx", () => {
        expect(canAnchorAutoIncident(base)).toBe(true);
    });

    it("rejects already anchored or resolved", () => {
        expect(canAnchorAutoIncident({ ...base, txHash: "abc" })).toBe(false);
        expect(canAnchorAutoIncident({ ...base, status: "Resolved" })).toBe(false);
        expect(canAnchorAutoIncident({ ...base, source: "on_chain" })).toBe(false);
    });

    it("maps motor types to on-chain enum", () => {
        expect(mapAutoIncidentToOnChainType("COLD_CHAIN_BROKEN")).toBe(
            CriticalIncidentTypeCode.TempViolation,
        );
        expect(mapAutoIncidentToOnChainType("SHIPMENT_DELAYED")).toBe(
            CriticalIncidentTypeCode.Delay,
        );
        expect(mapAutoIncidentToOnChainType("SHIPMENT_LOST")).toBe(
            CriticalIncidentTypeCode.Lost,
        );
    });
});
