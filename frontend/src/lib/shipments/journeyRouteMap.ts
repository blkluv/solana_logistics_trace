import type { LocationCatalogItem } from "@/lib/api/locations";

import { findCatalogLocationByField } from "./locationEndpoint";
import { parseCoordEndpoint } from "./journeyTimeline";

export type JourneyRoutePoint = {
    role: "origin" | "destination";
    lat: number;
    lng: number;
    label: string;
};

function coordsFromRaw(
    raw: string,
    catalog: readonly LocationCatalogItem[],
): { lat: number; lng: number } | null {
    const parsed = parseCoordEndpoint(raw);
    if (parsed.lat != null && parsed.lng != null) {
        return { lat: parsed.lat, lng: parsed.lng };
    }
    const match = catalog.length ? findCatalogLocationByField(raw, catalog) : null;
    if (match) {
        return { lat: match.lat, lng: match.lng };
    }
    return null;
}

/** Puntos de origen y destino resolubles para el mapa del recorrido. */
export function resolveJourneyRoutePoints(
    origin: string,
    destination: string,
    catalog: readonly LocationCatalogItem[],
    originLabel: string,
    destinationLabel: string,
): JourneyRoutePoint[] {
    const out: JourneyRoutePoint[] = [];
    const o = coordsFromRaw(origin, catalog);
    if (o) {
        out.push({ role: "origin", ...o, label: originLabel });
    }
    const d = coordsFromRaw(destination, catalog);
    if (d) {
        out.push({ role: "destination", ...d, label: destinationLabel });
    }
    return out;
}
