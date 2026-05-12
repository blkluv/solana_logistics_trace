"use client";

import type { CheckpointItem } from "@/lib/api/shipments";

export type MapViewProps = {
    checkpoints: CheckpointItem[];
};

/**
 * Vista de mapa ligera (sin tiles externos): muestra puntos con coordenadas resueltas.
 * Código cargado de forma diferida desde la página de detalle (`next/dynamic`).
 */
export function MapView({ checkpoints }: MapViewProps) {
    const points = checkpoints.filter(
        (c) => c.latitude !== null && c.longitude !== null && Number.isFinite(c.latitude!) && Number.isFinite(c.longitude!),
    );

    if (points.length === 0) {
        return (
            <p className="text-sm text-muted mb-0" data-testid="map-view-empty">
                Sin coordenadas en checkpoints (usa columnas lat/lng o metadata lat/lng).
            </p>
        );
    }

    return (
        <div className="panel-etapa2-map" data-testid="map-view">
            <div className="panel-etapa2-map__canvas" aria-label="Mapa esquemático de checkpoints">
                {points.map((c) => (
                    <div
                        key={c.checkpointId}
                        className="panel-etapa2-map__marker"
                        title={`${c.type} @ ${c.latitude}, ${c.longitude}`}
                    >
                        <span className="panel-etapa2-map__marker-dot" aria-hidden />
                        <span className="panel-etapa2-map__marker-label">{c.type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
