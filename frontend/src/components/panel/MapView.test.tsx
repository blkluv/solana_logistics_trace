import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MapView } from "@/components/panel/MapView";
import type { CheckpointItem } from "@/lib/api/shipments";

function cp(lat: number | null, lng: number | null): CheckpointItem {
    return {
        checkpointId: `${lat}-${lng}`,
        onChainCheckpointId: "1",
        type: "Pickup",
        occurredAt: "2025-01-01T00:00:00.000Z",
        location: null,
        actor: "A",
        temperatureCenti: null,
        humidity: null,
        latitude: lat,
        longitude: lng,
        metadata: {},
        txHash: "x",
    };
}

describe("MapView", () => {
    it("shows empty hint when no coordinates", () => {
        render(<MapView checkpoints={[cp(null, null)]} />);
        expect(screen.getByTestId("map-view-empty")).toBeInTheDocument();
    });

    it("renders markers when lat/lng present", () => {
        render(<MapView checkpoints={[cp(10.5, -66.1)]} />);
        expect(screen.getByTestId("map-view")).toBeInTheDocument();
        expect(screen.queryByTestId("map-view-empty")).not.toBeInTheDocument();
    });
});
