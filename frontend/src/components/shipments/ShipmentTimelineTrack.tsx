"use client";

import { CheckpointTypeIcon, IconLink } from "@/components/ui/TraceIcons";
import { maskTxSignature } from "@/lib/wallet/display";
import type { IncidentItem } from "@/lib/api/incidents";
import type { CheckpointItem } from "@/lib/api/shipments";
import {
    incidentSeverityClass,
    incidentSeverityLabel,
    incidentSourceLabel,
    incidentTypeLabel,
} from "@/lib/incidents/display";
import {
    checkpointIconKind,
    checkpointTypeLabel,
    formatOccurredAt,
} from "@/lib/shipments/checkpointDisplay";
import { buildTraceabilityTimeline } from "@/lib/shipments/traceabilityTimeline";

export type ShipmentTimelineTrackProps = {
    checkpoints: CheckpointItem[];
    incidents?: IncidentItem[];
};

export function ShipmentTimelineTrack({
    checkpoints,
    incidents = [],
}: ShipmentTimelineTrackProps) {
    const entries = buildTraceabilityTimeline(checkpoints, incidents);
    if (entries.length === 0) {
        return (
            <p className="text-sm text-muted mb-0" role="status">
                Sin eventos logísticos registrados.
            </p>
        );
    }

    return (
        <ol className="shipment-timeline" data-testid="checkpoint-timeline">
            {entries.map((entry) => {
                if (entry.kind === "checkpoint") {
                    const c = entry.checkpoint;
                    const kind = checkpointIconKind(c.type);
                    const isSystem = c.actor.startsWith("system@");
                    return (
                        <li key={c.checkpointId} className="shipment-timeline__item">
                            <span
                                className={`shipment-timeline__icon shipment-timeline__icon--${kind}`}
                            >
                                <CheckpointTypeIcon kind={kind} />
                            </span>
                            <div className="shipment-timeline__body">
                                <div className="shipment-timeline__row">
                                    <span
                                        className={`shipment-timeline__type shipment-timeline__type--${kind}`}
                                    >
                                        {checkpointTypeLabel(c.type)}
                                    </span>
                                    <time className="shipment-timeline__time" dateTime={c.occurredAt}>
                                        {formatOccurredAt(c.occurredAt)}
                                    </time>
                                </div>
                                {c.location ? (
                                    <p className="shipment-timeline__location">{c.location}</p>
                                ) : null}
                                <p className="shipment-timeline__actor">
                                    <span className="shipment-timeline__actor-name">
                                        {c.actorDisplayName}
                                    </span>
                                    {!isSystem ? (
                                        <span className="shipment-timeline__actor-wallet mono">
                                            {c.actorWalletMasked}
                                            {c.actorRole ? ` · ${c.actorRole}` : ""}
                                        </span>
                                    ) : null}
                                </p>
                                {(c.temperatureCenti != null || c.humidity != null) && (
                                    <p className="shipment-timeline__sensors text-xs text-muted mb-0">
                                        {c.temperatureCenti != null
                                            ? `Temp ${(c.temperatureCenti / 100).toFixed(1)} °C`
                                            : null}
                                        {c.temperatureCenti != null && c.humidity != null
                                            ? " · "
                                            : null}
                                        {c.humidity != null ? `HR ${c.humidity}%` : null}
                                    </p>
                                )}
                                {c.txHash ? (
                                    <p className="shipment-timeline__tx">
                                        <IconLink className="trace-icon shipment-timeline__tx-icon" />
                                        <span className="shipment-timeline__tx-label">Tx</span>
                                        <code
                                            className="shipment-timeline__tx-hash mono"
                                            title={c.txHash}
                                        >
                                            {maskTxSignature(c.txHash)}
                                        </code>
                                    </p>
                                ) : null}
                            </div>
                        </li>
                    );
                }

                const inc = entry.incident;
                const itemClass = [
                    "shipment-timeline__item",
                    "shipment-timeline__item--incident",
                    entry.isLoss && "shipment-timeline__item--incident-lost",
                ]
                    .filter(Boolean)
                    .join(" ");

                return (
                    <li key={`incident-${inc.id}`} className={itemClass}>
                        <span
                            className={`shipment-timeline__icon shipment-timeline__icon--incident${entry.isLoss ? " shipment-timeline__icon--incident-lost" : ""}`}
                            aria-hidden
                        >
                            !
                        </span>
                        <div className="shipment-timeline__body">
                            <div className="shipment-timeline__row">
                                <span className="shipment-timeline__type shipment-timeline__type--incident">
                                    Incidencia · {incidentTypeLabel(inc.incidentType)}
                                </span>
                                <time className="shipment-timeline__time" dateTime={inc.detectedAt}>
                                    {formatOccurredAt(inc.detectedAt)}
                                </time>
                            </div>
                            <p className="shipment-timeline__incident-desc">{inc.description}</p>
                            <p className="shipment-timeline__actor mb-0">
                                <span className={incidentSeverityClass(inc.severity)}>
                                    {incidentSeverityLabel(inc.severity)}
                                </span>
                                <span className="shipment-timeline__incident-meta text-xs text-muted">
                                    {incidentSourceLabel(inc.source)}
                                    {inc.status === "Open" ? " · Abierta" : " · Resuelta"}
                                </span>
                            </p>
                            {inc.txHash ? (
                                <p className="shipment-timeline__tx">
                                    <IconLink className="trace-icon shipment-timeline__tx-icon" />
                                    <span className="shipment-timeline__tx-label">Tx</span>
                                    <code
                                        className="shipment-timeline__tx-hash mono"
                                        title={inc.txHash}
                                    >
                                        {maskTxSignature(inc.txHash)}
                                    </code>
                                </p>
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
