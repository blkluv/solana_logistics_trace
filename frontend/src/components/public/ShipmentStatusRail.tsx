"use client";

import { ShipmentJourneyTimeline } from "@/components/shipments/ShipmentJourneyTimeline";
import type { CheckpointItem } from "@/lib/api/shipments";

export type ShipmentStatusRailProps = {
    status: string;
    origin?: string;
    destination?: string;
    checkpoints?: CheckpointItem[];
};

/**
 * @deprecated Use `ShipmentJourneyTimeline` directly. Mantiene compatibilidad con consulta pública.
 */
export function ShipmentStatusRail({
    status,
    origin = "—",
    destination = "—",
    checkpoints = [],
}: ShipmentStatusRailProps) {
    return (
        <ShipmentJourneyTimeline
            origin={origin}
            destination={destination}
            status={status}
            checkpoints={checkpoints}
        />
    );
}
