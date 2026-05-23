"use client";

import { ShipmentJourneyTimeline } from "@/components/shipments/ShipmentJourneyTimeline";
import type { CheckpointItem } from "@/lib/api/shipments";

export type ShipmentStatusRailProps = {
    status: string;
    origin?: string;
    destination?: string;
    checkpoints?: CheckpointItem[];
    createdAt?: string;
    apiBaseUrl?: string;
};

/**
 * @deprecated Use `ShipmentJourneyTimeline` directly. Mantiene compatibilidad con consulta pública.
 */
export function ShipmentStatusRail({
    status,
    origin = "—",
    destination = "—",
    checkpoints = [],
    createdAt = new Date(0).toISOString(),
    apiBaseUrl,
}: ShipmentStatusRailProps) {
    return (
        <ShipmentJourneyTimeline
            origin={origin}
            destination={destination}
            status={status}
            checkpoints={checkpoints}
            createdAt={createdAt}
            apiBaseUrl={apiBaseUrl}
        />
    );
}
