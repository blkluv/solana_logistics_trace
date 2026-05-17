/** Formato canónico en cadena/DB: `lat,lng` con hasta 6 decimales. */

export type GeoPoint = {
    lat: number;
    lng: number;
};

const COORD_PAIR = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/;

export function formatGeoPoint(p: GeoPoint): string {
    return `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
}

export function parseGeoPoint(raw: string): GeoPoint | null {
    const t = raw.trim();
    if (!t) {
        return null;
    }
    const m = COORD_PAIR.exec(t);
    if (!m) {
        return null;
    }
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return null;
    }
    return { lat, lng };
}

export function isGeoPointString(raw: string): boolean {
    return parseGeoPoint(raw) !== null;
}

export function geoPointValidationError(raw: string, label: string): string | null {
    const t = raw.trim();
    if (!t) {
        return `Indique ${label}.`;
    }
    return null;
}

export function geoPointCoordsValidationError(
    mode: "text" | "coordinates",
    raw: string,
    label: string,
): string | null {
    if (mode === "text") {
        return geoPointValidationError(raw, label);
    }
    const p = parseGeoPoint(raw);
    if (!p) {
        return `${label}: seleccione un punto en el mapa o use el formato lat,lng.`;
    }
    return null;
}
