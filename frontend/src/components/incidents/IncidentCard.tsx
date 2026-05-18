"use client";

import type { IncidentItem } from "@/lib/api/incidents";
import {
    incidentSeverityClass,
    incidentSeverityLabel,
    incidentSourceLabel,
    incidentTypeLabel,
} from "@/lib/incidents/display";

export type IncidentCardProps = {
    incident: IncidentItem;
    compact?: boolean;
};

export function IncidentCard({ incident, compact }: IncidentCardProps) {
    return (
        <article className={`incident-card${compact ? " incident-card--compact" : ""}`}>
            <header className="incident-card__hd">
                <div className="incident-card__titles">
                    <h3 className="incident-card__title">{incidentTypeLabel(incident.incidentType)}</h3>
                    <p className="incident-card__meta text-xs text-muted mb-0">
                        {incidentSourceLabel(incident.source)}
                        {incident.ruleName ? ` · Regla ${incident.ruleName}` : ""}
                    </p>
                </div>
                <span className={incidentSeverityClass(incident.severity)}>
                    {incidentSeverityLabel(incident.severity)}
                </span>
            </header>
            <div className="incident-card__bd">
                <p className="incident-card__desc text-sm mb-2">{incident.description || "—"}</p>
                <div className="incident-card__facts text-xs">
                    <p className="mb-1">
                        <span className="text-muted">Estado: </span>
                        {incident.status}
                    </p>
                    <p className="mb-1">
                        <span className="text-muted">Detectada: </span>
                        {new Date(incident.detectedAt).toLocaleString()}
                    </p>
                    {incident.txHash ? (
                        <p className="mb-0">
                            <span className="text-muted">Tx: </span>
                            <span className="mono break-all">{incident.txHash}</span>
                        </p>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
