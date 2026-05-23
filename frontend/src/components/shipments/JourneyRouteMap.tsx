"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";

import type { JourneyRoutePoint } from "@/lib/shipments/journeyRouteMap";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [13.7, -89.2];
const DEFAULT_ZOOM = 7;

function ensureLeafletIcons(): void {
    const proto = L.Icon.Default.prototype as L.Icon.Default & {
        _getIconUrl?: unknown;
    };
    delete proto._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
}

function markerIcon(role: JourneyRoutePoint["role"]): L.DivIcon {
    const isOrigin = role === "origin";
    return L.divIcon({
        className: "",
        html: `<span class="journey-route-marker journey-route-marker--${
            isOrigin ? "origin" : "dest"
        }" aria-hidden="true">${isOrigin ? "O" : "D"}</span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        tooltipAnchor: [0, -28],
    });
}

function FitRouteBounds({ points }: { points: JourneyRoutePoint[] }) {
    const map = useMap();
    const positions = useMemo(
        () => points.map((p) => [p.lat, p.lng] as [number, number]),
        [points],
    );

    useEffect(() => {
        if (positions.length >= 2) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [48, 48], maxZoom: 11 });
            return;
        }
        if (positions.length === 1) {
            map.setView(positions[0]!, 10);
        }
    }, [map, positions]);

    return null;
}

export type JourneyRouteMapProps = {
    points: JourneyRoutePoint[];
    /** `aside` = tarjeta Recorrido del detalle; `journey` = bloque en timeline (legacy). */
    placement?: "aside" | "journey";
};

export function JourneyRouteMap({ points, placement = "journey" }: JourneyRouteMapProps) {
    useEffect(() => {
        ensureLeafletIcons();
    }, []);

    const positions = useMemo(
        () => points.map((p) => [p.lat, p.lng] as [number, number]),
        [points],
    );

    const mapKey = useMemo(
        () => positions.map((p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`).join("|") || "empty",
        [positions],
    );

    const center = positions[0] ?? DEFAULT_CENTER;
    const zoom = positions.length === 1 ? 10 : DEFAULT_ZOOM;

    const rootClass =
        placement === "aside" ? "journey-route-map journey-route-map--aside" : "shipment-journey__map";
    const canvasClass =
        placement === "aside"
            ? "journey-route-map__canvas"
            : "shipment-journey__map-canvas";

    if (points.length === 0) {
        return (
            <div
                className={`${rootClass} ${rootClass}--empty`}
                data-testid="journey-route-map-empty"
            >
                <p className="text-sm text-muted mb-0">
                    Sin coordenadas de origen o destino para mostrar el mapa.
                </p>
            </div>
        );
    }

    return (
        <div className={rootClass} data-testid="journey-route-map">
            <MapContainer
                key={mapKey}
                center={center}
                zoom={zoom}
                className={canvasClass}
                scrollWheelZoom={false}
                dragging
                aria-label="Mapa del recorrido: origen y destino"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitRouteBounds points={points} />
                {positions.length >= 2 ? (
                    <Polyline
                        positions={positions}
                        pathOptions={{
                            color: "var(--color-primary)",
                            weight: 3,
                            opacity: 0.75,
                            dashArray: "8 6",
                        }}
                    />
                ) : null}
                {points.map((p) => (
                    <Marker
                        key={p.role}
                        position={[p.lat, p.lng]}
                        icon={markerIcon(p.role)}
                    >
                        <Tooltip direction="top" offset={[0, -24]} opacity={0.95}>
                            {p.role === "origin" ? "Origen" : "Destino"}: {p.label}
                        </Tooltip>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
