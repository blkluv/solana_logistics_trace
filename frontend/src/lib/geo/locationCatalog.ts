import { formatGeoPoint, type GeoPoint } from "@/lib/geo/geoPoint";
import type { LocationCatalogItem } from "@/lib/api/locations";

/** Valor on-chain/DB: coordenadas `lat,lng` (hasta 128 caracteres). */
export function locationToShipmentField(loc: LocationCatalogItem): string {
    return formatGeoPoint({ lat: loc.lat, lng: loc.lng });
}

export function geoPointFromLocation(loc: LocationCatalogItem): GeoPoint {
    return { lat: loc.lat, lng: loc.lng };
}
