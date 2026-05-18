"use client";

import type { ReactNode } from "react";

import { IncidentListPanel } from "@/components/incidents/IncidentListPanel";
import { useShipmentIncidents } from "@/lib/api/useShipmentIncidents";

export type ShipmentIncidentsSectionProps = {
    apiBaseUrl: string;
    shipmentId: string;
    wallet: string | null;
    headerAction?: ReactNode;
};

export function ShipmentIncidentsSection({
    apiBaseUrl,
    shipmentId,
    wallet,
    headerAction,
}: ShipmentIncidentsSectionProps) {
    const { items, loading, error, reload } = useShipmentIncidents(
        apiBaseUrl,
        shipmentId,
        wallet,
    );
    return (
        <section className="card mt-2 shipment-incidents" aria-labelledby="shipment-incidents-hd">
            <div className="card__hd shipment-incidents__hd">
                <h2 id="shipment-incidents-hd" className="shipment-incidents__title">
                    Incidencias e inteligencia operativa
                </h2>
                {headerAction}
            </div>
            <div className="card__bd">
                <p className="text-xs text-muted mb-3">
                    Detecciones automáticas del motor (telemetría) y reportes críticos firmados on-chain.
                </p>
                <IncidentListPanel items={items} loading={loading} error={error} />
                {wallet ? (
                    <button
                        type="button"
                        className="btn btn--ghost btn--sm mt-3"
                        onClick={() => void reload()}
                    >
                        Actualizar incidencias
                    </button>
                ) : null}
            </div>
        </section>
    );
}
