import { describe, expect, it } from "vitest";

import type { IncidentItem } from "@/lib/api/incidents";
import type { CheckpointItem } from "@/lib/api/shipments";

import {
    isLossIncident,
    pickIncidentForAutoAnchorModal,
    resolveLossJourneyStepId,
} from "./criticalIncidentFlow";

const baseIncident: IncidentItem = {
    id: "inc-1",
    shipmentId: "ship-1",
    incidentType: "COLD_CHAIN_BROKEN",
    severity: "Critical",
    status: "Open",
    source: "auto",
    description: "Temp alta",
    detectedAt: "2026-01-02T12:00:00Z",
    resolvedAt: null,
    ruleName: "cold_chain",
    txHash: null,
    evidenceJson: null,
};

const pickupCp: CheckpointItem = {
    checkpointId: "1",
    onChainCheckpointId: "1",
    type: "Pickup",
    occurredAt: "2026-01-01T10:00:00Z",
    location: null,
    actor: "a",
    actorWalletMasked: "x",
    actorDisplayName: "A",
    actorRole: null,
    temperatureCenti: null,
    humidity: null,
    latitude: null,
    longitude: null,
    metadata: {},
    txHash: "t1",
};

describe("criticalIncidentFlow", () => {
    it("picks first auto incident pending on-chain anchor", () => {
        const prompted = new Set<string>();
        const pick = pickIncidentForAutoAnchorModal([baseIncident], prompted);
        expect(pick?.id).toBe("inc-1");
    });

    it("skips incidents already prompted in session", () => {
        const prompted = new Set(["inc-1"]);
        expect(pickIncidentForAutoAnchorModal([baseIncident], prompted)).toBeNull();
    });

    it("detects loss from motor and on-chain types", () => {
        expect(isLossIncident({ ...baseIncident, incidentType: "SHIPMENT_LOST" })).toBe(true);
        expect(isLossIncident({ ...baseIncident, incidentType: "Lost" })).toBe(true);
        expect(isLossIncident(baseIncident)).toBe(false);
    });

    it("highlights current journey step when open loss exists", () => {
        const transitCp: CheckpointItem = {
            ...pickupCp,
            checkpointId: "2",
            type: "Transit",
            occurredAt: "2026-01-02T11:00:00Z",
        };
        const stepId = resolveLossJourneyStepId(
            [{ ...baseIncident, incidentType: "Lost", status: "Open" }],
            [pickupCp, transitCp],
            "2026-01-01T08:00:00Z",
        );
        expect(stepId).toBe("transit");
    });

    it("returns null when loss is resolved", () => {
        expect(
            resolveLossJourneyStepId(
                [{ ...baseIncident, incidentType: "Lost", status: "Resolved" }],
                [pickupCp],
                "2026-01-01T08:00:00Z",
            ),
        ).toBeNull();
    });
});
