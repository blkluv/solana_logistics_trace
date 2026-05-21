/**
 * Línea de tiempo del ciclo logístico (estados + eventos on-chain).
 */

import type { FlowStepState } from "@/lib/panel/shipmentLifecycle";

export type JourneyStepIconKind =
    | "created"
    | "pickup"
    | "hub"
    | "transit"
    | "out"
    | "delivered";

export type JourneyEventStep = {
    id: string;
    label: string;
    icon: JourneyStepIconKind;
    checkpointTypes: readonly string[];
};

/** Orden de negocio: eventos que puede atravesar un envío en el MVP. */
export const JOURNEY_EVENT_STEPS: readonly JourneyEventStep[] = [
    { id: "created", label: "Creado", icon: "created", checkpointTypes: [] },
    { id: "pickup", label: "Recogida", icon: "pickup", checkpointTypes: ["Pickup"] },
    { id: "hub", label: "En hub", icon: "hub", checkpointTypes: ["HubIn", "HubOut"] },
    { id: "transit", label: "En tránsito", icon: "transit", checkpointTypes: ["Transit"] },
    { id: "out", label: "En reparto", icon: "out", checkpointTypes: ["DeliveryAttempt"] },
    {
        id: "delivered",
        label: "Entregado",
        icon: "delivered",
        checkpointTypes: ["Delivered"],
    },
] as const;

export type CoordEndpoint = {
    raw: string;
    label: string;
    lat: number | null;
    lng: number | null;
};

/** Parsea `origen` / `destino` almacenados como `"lat,lng"` o texto libre. */
export function parseCoordEndpoint(raw: string): CoordEndpoint {
    const trimmed = raw.trim();
    const parts = trimmed.split(",").map((p) => p.trim());
    if (parts.length === 2) {
        const lat = Number.parseFloat(parts[0]);
        const lng = Number.parseFloat(parts[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            return {
                raw: trimmed,
                label: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
                lat,
                lng,
            };
        }
    }
    return { raw: trimmed, label: trimmed, lat: null, lng: null };
}

function statusToStepIndex(status: string): number {
    switch (status) {
        case "Created":
            return 0;
        case "AtHub":
            return 2;
        case "InTransit":
            return 3;
        case "OutForDelivery":
            return 4;
        case "Delivered":
            return 5;
        case "Returned":
        case "Cancelled":
            return -1;
        default:
            return 0;
    }
}

export type ResolvedJourneyStep = {
    step: JourneyEventStep;
    state: FlowStepState;
    eventRecorded: boolean;
};

export function resolveJourneyStepStates(
    status: string,
    checkpointTypes: Iterable<string>,
): ResolvedJourneyStep[] {
    const recorded = new Set(checkpointTypes);
    const currentIdx = statusToStepIndex(status);
    const isException = status === "Cancelled" || status === "Returned";

    return JOURNEY_EVENT_STEPS.map((step, index) => {
        const eventRecorded =
            step.checkpointTypes.length > 0 &&
            step.checkpointTypes.some((t) => recorded.has(t));

        let state: FlowStepState;
        if (isException) {
            state = "offpath";
        } else if (index < currentIdx) {
            state = "past";
        } else if (index === currentIdx) {
            state = "current";
        } else {
            state = "future";
        }

        if (eventRecorded && state === "future") {
            state = "past";
        }

        if (step.id === "created" && status === "Created") {
            state = "current";
        }

        return { step, state, eventRecorded };
    });
}

export function exceptionStatusLabel(status: string): string | null {
    if (status === "Cancelled") {
        return "Envío cancelado";
    }
    if (status === "Returned") {
        return "Envío devuelto";
    }
    return null;
}
