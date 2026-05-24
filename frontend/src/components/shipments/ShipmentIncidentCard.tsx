"use client";

import { useCallback, useState } from "react";

import { IncidentTypeIcon, IconCheckCircle, IconLink } from "@/components/ui/TraceIcons";
import { canAnchorAutoIncident } from "@/lib/incidents/anchorOnChain";
import { postResolveIncident, type IncidentItem } from "@/lib/api/incidents";
import {
    incidentSeverityClass,
    incidentSeverityLabel,
    incidentSourceLabel,
    incidentTypeLabel,
} from "@/lib/incidents/display";
import { maskWallet } from "@/lib/wallet/display";

export type ShipmentIncidentCardProps = {
    incident: IncidentItem;
    apiBaseUrl: string;
    wallet: string;
    canResolve: boolean;
    canAnchorOnChain?: boolean;
    onAnchorOnChain?: (incident: IncidentItem) => void;
    onResolved?: () => void;
};

function evidenceSummary(evidence: Record<string, unknown> | null): string | null {
    if (!evidence) {
        return null;
    }
    if (typeof evidence.temperature === "number") {
        return `Temperatura: ${evidence.temperature} °C`;
    }
    if (typeof evidence.humidity_pct === "number") {
        return `Humedad: ${evidence.humidity_pct}%`;
    }
    if (typeof evidence.deviation_km === "number") {
        return `Desviación: ${evidence.deviation_km.toFixed?.(1) ?? evidence.deviation_km} km`;
    }
    if (typeof evidence.hours_elapsed === "number") {
        return `Sin evento: ${evidence.hours_elapsed} h`;
    }
    return null;
}

export function ShipmentIncidentCard({
    incident,
    apiBaseUrl,
    wallet,
    canResolve,
    canAnchorOnChain = false,
    onAnchorOnChain,
    onResolved,
}: ShipmentIncidentCardProps) {
    const [resolving, setResolving] = useState(false);
    const [banner, setBanner] = useState<string | null>(null);
    const isOpen = incident.status === "Open";
    const evidence = evidenceSummary(incident.evidenceJson);
    const showAnchor =
        canAnchorOnChain && onAnchorOnChain && canAnchorAutoIncident(incident);

    const handleResolve = useCallback(async () => {
        setResolving(true);
        setBanner(null);
        const res = await postResolveIncident(apiBaseUrl, incident.id, wallet);
        setResolving(false);
        if (!res.ok) {
            setBanner("No se pudo resolver la incidencia.");
            return;
        }
        setBanner("Incidencia marcada como resuelta.");
        onResolved?.();
    }, [apiBaseUrl, incident.id, wallet, onResolved]);

    return (
        <article
            className={`shipment-incident-card${isOpen ? " shipment-incident-card--open" : ""}`}
        >
            <header className="shipment-incident-card__hd">
                <span className="shipment-incident-card__icon" aria-hidden>
                    <IncidentTypeIcon type={incident.incidentType} />
                </span>
                <div className="shipment-incident-card__titles">
                    <h3 className="shipment-incident-card__title">
                        {incidentTypeLabel(incident.incidentType)}
                    </h3>
                    <p className="shipment-incident-card__meta">
                        {incidentSourceLabel(incident.source)}
                        {incident.ruleName ? ` · ${incident.ruleName}` : ""}
                    </p>
                </div>
                <span className={incidentSeverityClass(incident.severity)}>
                    {incidentSeverityLabel(incident.severity)}
                </span>
            </header>
            <div className="shipment-incident-card__bd">
                <p className="shipment-incident-card__desc">{incident.description || "—"}</p>
                {evidence ? (
                    <p className="shipment-incident-card__evidence text-xs text-muted">{evidence}</p>
                ) : null}
                <dl className="shipment-incident-card__facts">
                    <div>
                        <dt>Estado</dt>
                        <dd>{incident.status === "Open" ? "Abierta" : "Resuelta"}</dd>
                    </div>
                    <div>
                        <dt>Detectada</dt>
                        <dd>{new Date(incident.detectedAt).toLocaleString()}</dd>
                    </div>
                    {incident.resolvedAt ? (
                        <div>
                            <dt>Resuelta</dt>
                            <dd>{new Date(incident.resolvedAt).toLocaleString()}</dd>
                        </div>
                    ) : null}
                    {incident.txHash ? (
                        <div className="shipment-incident-card__fact--wide">
                            <dt>Transacción</dt>
                            <dd className="mono" title={incident.txHash}>
                                {maskWallet(incident.txHash)}
                            </dd>
                        </div>
                    ) : null}
                </dl>
                {banner ? (
                    <p className="text-xs mt-2 mb-0" role="status">
                        {banner}
                    </p>
                ) : null}
                <div className="shipment-incident-card__actions">
                    {showAnchor ? (
                        <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            onClick={() => onAnchorOnChain(incident)}
                        >
                            <IconLink className="trace-icon trace-icon--inline" />
                            Registrar en blockchain
                        </button>
                    ) : null}
                    {isOpen && canResolve ? (
                        <button
                            type="button"
                            className="btn btn--ghost btn--sm shipment-incident-card__resolve"
                            disabled={resolving}
                            onClick={() => void handleResolve()}
                        >
                            <IconCheckCircle className="trace-icon trace-icon--inline" />
                            {resolving ? "Resolviendo…" : "Marcar resuelta"}
                        </button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
