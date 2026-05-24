import type { IncidentItem } from "@/lib/api/incidents";
import { CriticalIncidentTypeCode } from "@/lib/solana/ix";

/** Incidencia automática abierta que aún no tiene tx on-chain. */
export function canAnchorAutoIncident(incident: IncidentItem): boolean {
    return (
        incident.source === "auto" &&
        incident.status === "Open" &&
        !incident.txHash &&
        (incident.severity === "Critical" || incident.severity === "High")
    );
}

/** Mapea tipos del motor a variantes on-chain del programa. */
export function mapAutoIncidentToOnChainType(incidentType: string): CriticalIncidentTypeCode {
    switch (incidentType) {
        case "COLD_CHAIN_BROKEN":
        case "HUMIDITY_OUT_OF_RANGE":
            return CriticalIncidentTypeCode.TempViolation;
        case "SHIPMENT_DELAYED":
            return CriticalIncidentTypeCode.Delay;
        case "ROUTE_DEVIATION":
            return CriticalIncidentTypeCode.Other;
        case "SENSOR_OFFLINE":
            return CriticalIncidentTypeCode.Other;
        case "SHIPMENT_LOST":
            return CriticalIncidentTypeCode.Lost;
        default:
            return CriticalIncidentTypeCode.Other;
    }
}

export function onChainSeverityFromAuto(severity: string): "High" | "Critical" {
    return severity === "Critical" ? "Critical" : "High";
}

export function buildAnchorEvidencePayload(
    shipmentServiceId: string,
    incident: IncidentItem,
    onChainTypeKey: string,
    severity: "High" | "Critical",
    description: string,
): Record<string, unknown> {
    return {
        shipmentId: shipmentServiceId,
        incidentType: onChainTypeKey,
        severity,
        description,
        reportedAt: new Date().toISOString(),
        anchoredFrom: incident.id,
        motorRule: incident.ruleName,
        motorEvidence: incident.evidenceJson,
    };
}
