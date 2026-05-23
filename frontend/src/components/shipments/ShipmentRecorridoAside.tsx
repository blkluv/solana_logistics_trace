"use client";

import dynamic from "next/dynamic";

import { useLocationsCatalog } from "@/lib/api/useLocationsCatalog";
import { resolveEndpointDisplay } from "@/lib/shipments/locationEndpoint";
import { resolveJourneyRoutePoints } from "@/lib/shipments/journeyRouteMap";

const JourneyRouteMapLazy = dynamic(
    () =>
        import("@/components/shipments/JourneyRouteMap").then((m) => ({
            default: m.JourneyRouteMap,
        })),
    {
        ssr: false,
        loading: () => (
            <div
                className="shipment-detail-pro__map-skeleton text-sm text-muted"
                role="status"
            >
                Cargando mapa…
            </div>
        ),
    },
);

export type ShipmentRecorridoAsideProps = {
    origin: string;
    destination: string;
    apiBaseUrl?: string;
};

/** Mapa origen/destino para la tarjeta lateral «Recorrido» (columna junto a Trazabilidad). */
export function ShipmentRecorridoAside({ origin, destination, apiBaseUrl }: ShipmentRecorridoAsideProps) {
    const { items: locationCatalog } = useLocationsCatalog(apiBaseUrl);
    const originDisplay = resolveEndpointDisplay(origin, locationCatalog);
    const destinationDisplay = resolveEndpointDisplay(destination, locationCatalog);
    const routePoints = resolveJourneyRoutePoints(
        origin,
        destination,
        locationCatalog,
        originDisplay.title,
        destinationDisplay.title,
    );

    return (
        <>
            <p className="shipment-detail-pro__route-summary text-sm mb-2">
                <span className="shipment-detail-pro__route-summary-label">Origen</span>
                {originDisplay.title}
                <span className="shipment-detail-pro__route-summary-arrow" aria-hidden>
                    →
                </span>
                <span className="shipment-detail-pro__route-summary-label">Destino</span>
                {destinationDisplay.title}
            </p>
            <div className="shipment-detail-pro__map">
                <JourneyRouteMapLazy points={routePoints} placement="aside" />
            </div>
        </>
    );
}
