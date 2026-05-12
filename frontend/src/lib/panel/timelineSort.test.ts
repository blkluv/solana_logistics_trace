import { describe, expect, it } from "vitest";

import type { CheckpointItem } from "@/lib/api/shipments";
import { sortCheckpointsByOccurredAt } from "@/lib/panel/timelineSort";

function cp(id: string, at: string): CheckpointItem {
    return {
        checkpointId: id,
        onChainCheckpointId: id,
        type: "Pickup",
        occurredAt: at,
        location: null,
        actor: "A",
        temperatureCenti: null,
        humidity: null,
        latitude: null,
        longitude: null,
        metadata: {},
        txHash: "x",
    };
}

describe("sortCheckpointsByOccurredAt", () => {
    it("orders by occurredAt ascending", () => {
        const a = [cp("2", "2025-01-02T00:00:00.000Z"), cp("1", "2025-01-01T00:00:00.000Z")];
        const s = sortCheckpointsByOccurredAt(a);
        expect(s.map((x) => x.checkpointId)).toEqual(["1", "2"]);
    });
});
