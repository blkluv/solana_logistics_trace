"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { IncidentHubNavLink } from "@/components/incidents/IncidentHubNavLink";
import { TelemetryPanel } from "@/components/incidents/TelemetryPanel";
import { CheckpointTable } from "@/components/shipments/CheckpointTable";
import { ShipmentIncidentCard } from "@/components/shipments/ShipmentIncidentCard";
import { ShipmentParticipantChip } from "@/components/shipments/ShipmentParticipantChip";
import { ShipmentTimelineTrack } from "@/components/shipments/ShipmentTimelineTrack";
import { IconPackage, IconThermometer, IconAlert } from "@/components/ui/TraceIcons";
import { useShipmentIncidents } from "@/lib/api/useShipmentIncidents";
import { useShipmentTelemetry } from "@/lib/api/useShipmentTelemetry";
import type { ShipmentDetail } from "@/lib/api/shipments";
import { canResolveIncident } from "@/lib/panel/capabilities";
import { statusBadgeClass } from "@/lib/shipments/display";

const MapViewLazy = dynamic(
    () => import("@/components/panel/MapView").then((m) => ({ default: m.MapView })),
    {
        ssr: false,
        loading: () => (
            <div className="shipment-detail-v2__map-skeleton text-sm text-muted">Cargando mapa…</div>
        ),
    },
);

export type ShipmentDetailWorkspaceProps = {
    detail: ShipmentDetail;
    apiBaseUrl: string;
    wallet: string | null;
    role: string | null;
    onDetailReload?: () => void;
    headerActions?: ReactNode;
    showCheckpointTable?: boolean;
    backLink?: ReactNode;
};

export function ShipmentDetailWorkspace({
    detail,
    apiBaseUrl,
    wallet,
    role,
    onDetailReload,
    headerActions,
    showCheckpointTable = false,
    backLink,
}: ShipmentDetailWorkspaceProps) {
    const { items, loading, error, reload } = useShipmentIncidents(
        apiBaseUrl,
        detail.shipmentId,
        wallet,
    );
    const telemetry = useShipmentTelemetry(apiBaseUrl, detail.shipmentId, wallet);
    const mayResolve = canResolveIncident(role);
    const openCount = detail.openIncidentCount ?? items.filter((i) => i.status === "Open").length;
    const productTitle = detail.productLabel ?? detail.product;

    const onIncidentResolved = () => {
        void reload();
        onDetailReload?.();
    };

    return (
        <div className="shipment-detail-v2">
            <header className="shipment-detail-v2__hero">
                <div className="shipment-detail-v2__hero-main">
                    {backLink}
                    <div className="shipment-detail-v2__hero-row">
                        <span className="shipment-detail-v2__hero-icon" aria-hidden>
                            <IconPackage />
                        </span>
                        <div>
                            <h1 className="shipment-detail-v2__title">{productTitle}</h1>
                            <p className="shipment-detail-v2__route">
                                {detail.origin} → {detail.destination}
                            </p>
                        </div>
                        <span className={statusBadgeClass(detail.status)}>{detail.status}</span>
                    </div>
                    <p className="shipment-detail-v2__id mono" title={detail.shipmentId}>
                        Envío {detail.shipmentId.slice(0, 8)}…
                        <span className="text-muted"> · on-chain #{detail.onChainShipmentId}</span>
                    </p>
                </div>
                {headerActions ? (
                    <div className="shipment-detail-v2__actions">{headerActions}</div>
                ) : null}
            </header>

            <div className="shipment-detail-v2__stats">
                <div className="shipment-detail-v2__stat">
                    <span className="shipment-detail-v2__stat-label">Checkpoints</span>
                    <span className="shipment-detail-v2__stat-value">{detail.checkpointCount}</span>
                </div>
                <div className="shipment-detail-v2__stat">
                    <span className="shipment-detail-v2__stat-label">
                        <IconAlert className="trace-icon trace-icon--inline" /> Incidencias
                    </span>
                    <span className="shipment-detail-v2__stat-value">
                        {detail.incidentCount}
                        {openCount > 0 ? (
                            <span className="shipment-detail-v2__stat-open"> ({openCount} abiertas)</span>
                        ) : null}
                    </span>
                </div>
                {detail.requiresColdChain ? (
                    <div className="shipment-detail-v2__stat">
                        <span className="shipment-detail-v2__stat-label">
                            <IconThermometer className="trace-icon trace-icon--inline" /> Frío
                        </span>
                        <span className="shipment-detail-v2__stat-value">Requerido</span>
                    </div>
                ) : null}
            </div>

            <div className="shipment-detail-v2__participants">
                <ShipmentParticipantChip label="Remitente" participant={detail.senderParticipant} />
                <ShipmentParticipantChip
                    label="Destinatario"
                    participant={detail.recipientParticipant}
                />
            </div>

            <div className="shipment-detail-v2__grid">
                <section className="shipment-detail-v2__col shipment-detail-v2__col--main">
                    <div className="card shipment-detail-v2__panel">
                        <div className="card__hd">
                            <h2 className="shipment-detail-v2__panel-title">Trazabilidad</h2>
                            <span className="text-xs text-muted">
                                {detail.checkpoints.length} eventos
                            </span>
                        </div>
                        <div className="card__bd">
                            <ShipmentTimelineTrack checkpoints={detail.checkpoints} />
                        </div>
                    </div>

                    {showCheckpointTable ? (
                        <div className="card shipment-detail-v2__panel mt-2">
                            <div className="card__hd">
                                <h2 className="shipment-detail-v2__panel-title">Registro detallado</h2>
                            </div>
                            <div className="card__bd">
                                <CheckpointTable checkpoints={detail.checkpoints} />
                            </div>
                        </div>
                    ) : null}

                    <div className="card shipment-detail-v2__panel mt-2">
                        <div className="card__hd shipment-detail-v2__panel-hd">
                            <div>
                                <h2 className="shipment-detail-v2__panel-title">Incidencias</h2>
                                <p className="text-xs text-muted mb-0">
                                    Automáticas y reportes on-chain · resolución operativa
                                </p>
                            </div>
                            <IncidentHubNavLink />
                        </div>
                        <div className="card__bd">
                            {loading ? (
                                <p className="text-sm text-muted mb-0">Cargando incidencias…</p>
                            ) : error ? (
                                <p className="text-sm admin-form__err mb-0" role="alert">
                                    {error}
                                </p>
                            ) : items.length === 0 ? (
                                <p className="text-sm text-muted mb-0" role="status">
                                    No hay incidencias registradas para este envío.
                                </p>
                            ) : (
                                <ul className="shipment-incident-stack">
                                    {items.map((inc) => (
                                        <li key={inc.id}>
                                            {wallet ? (
                                                <ShipmentIncidentCard
                                                    incident={inc}
                                                    apiBaseUrl={apiBaseUrl}
                                                    wallet={wallet}
                                                    canResolve={mayResolve}
                                                    onResolved={onIncidentResolved}
                                                />
                                            ) : (
                                                <ShipmentIncidentCard
                                                    incident={inc}
                                                    apiBaseUrl={apiBaseUrl}
                                                    wallet=""
                                                    canResolve={false}
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>

                <aside className="shipment-detail-v2__col shipment-detail-v2__col--side">
                    <div className="card shipment-detail-v2__panel">
                        <div className="card__hd">
                            <h2 className="shipment-detail-v2__panel-title">Mapa</h2>
                        </div>
                        <div className="card__bd shipment-detail-v2__map">
                            <MapViewLazy checkpoints={detail.checkpoints} />
                        </div>
                    </div>

                    <div className="card shipment-detail-v2__panel mt-2">
                        <div className="card__hd">
                            <h2 className="shipment-detail-v2__panel-title">Telemetría</h2>
                        </div>
                        <div className="card__bd">
                            <TelemetryPanel
                                items={telemetry.items}
                                loading={telemetry.loading}
                                error={telemetry.error}
                                unavailable={telemetry.unavailable}
                            />
                        </div>
                    </div>

                    <div className="card shipment-detail-v2__panel mt-2">
                        <div className="card__hd">
                            <h2 className="shipment-detail-v2__panel-title">Fechas</h2>
                        </div>
                        <div className="card__bd text-sm shipment-detail-v2__dates">
                            <p className="mb-2">
                                <span className="text-muted">Creado</span>
                                <br />
                                <time dateTime={detail.createdAt}>
                                    {new Date(detail.createdAt).toLocaleString()}
                                </time>
                            </p>
                            {detail.deliveredAt ? (
                                <p className="mb-0">
                                    <span className="text-muted">Entregado</span>
                                    <br />
                                    <time dateTime={detail.deliveredAt}>
                                        {new Date(detail.deliveredAt).toLocaleString()}
                                    </time>
                                </p>
                            ) : null}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
