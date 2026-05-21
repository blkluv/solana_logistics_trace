/** Etiquetas e iconografía de tipos de checkpoint en detalle de envío. */

export type CheckpointIconKind =
    | "pickup"
    | "hub"
    | "transit"
    | "delivery"
    | "sensor"
    | "default";

export function checkpointTypeLabel(type: string): string {
    const map: Record<string, string> = {
        Pickup: "Recogida",
        HubIn: "Entrada hub",
        HubOut: "Salida hub",
        Transit: "En tránsito",
        DeliveryAttempt: "Intento de entrega",
        Delivered: "Entregado",
        SensorData: "Telemetría",
    };
    return map[type] ?? type;
}

export function checkpointIconKind(type: string): CheckpointIconKind {
    switch (type) {
        case "Pickup":
            return "pickup";
        case "HubIn":
        case "HubOut":
            return "hub";
        case "Transit":
            return "transit";
        case "DeliveryAttempt":
        case "Delivered":
            return "delivery";
        case "SensorData":
            return "sensor";
        default:
            return "default";
    }
}

export function formatOccurredAt(iso: string): string {
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: "short",
            timeStyle: "short",
        });
    } catch {
        return iso;
    }
}
