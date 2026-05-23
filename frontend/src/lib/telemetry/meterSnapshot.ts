import type { TelemetryEventItem } from "@/lib/api/telemetry";
import { formatGeoPoint, type GeoPoint } from "@/lib/geo/geoPoint";

export type MeterSnapshot = {
    coordinates: GeoPoint | null;
    temperatureCelsius: number | null;
    humidityPct: number | null;
    /** Marca de tiempo más reciente entre las lecturas usadas. */
    capturedAt: string | null;
};

function latestByType(
    items: readonly TelemetryEventItem[],
    type: string,
): TelemetryEventItem | undefined {
    return items
        .filter((i) => i.telemetryType === type)
        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
}

/** Últimas lecturas GPS / temperatura / humedad del motor de simulación. */
export function buildMeterSnapshot(items: readonly TelemetryEventItem[]): MeterSnapshot {
    const gps = latestByType(items, "gps");
    const temperature = latestByType(items, "temperature");
    const humidity = latestByType(items, "humidity");

    const coordinates =
        gps?.latitude != null && gps.longitude != null
            ? { lat: gps.latitude, lng: gps.longitude }
            : null;

    const stamps = [gps?.recordedAt, temperature?.recordedAt, humidity?.recordedAt].filter(
        (s): s is string => Boolean(s),
    );
    const capturedAt =
        stamps.length > 0 ? stamps.sort((a, b) => b.localeCompare(a))[0]! : null;

    return {
        coordinates,
        temperatureCelsius: temperature?.valueNumeric ?? null,
        humidityPct: humidity?.valueNumeric ?? null,
        capturedAt,
    };
}

export function formatMeterSnapshotSummary(snapshot: MeterSnapshot): string {
    const parts: string[] = [];
    if (snapshot.coordinates) {
        parts.push(formatGeoPoint(snapshot.coordinates));
    }
    if (snapshot.temperatureCelsius != null) {
        parts.push(`${snapshot.temperatureCelsius.toFixed(1)} °C`);
    }
    if (snapshot.humidityPct != null) {
        parts.push(`${Math.round(snapshot.humidityPct)} % HR`);
    }
    return parts.length > 0 ? parts.join(" · ") : "Sin lecturas recientes";
}

/** Valores para inputs del formulario (°C y % legibles). */
export function meterSnapshotToFormFields(snapshot: MeterSnapshot): {
    coordValue: string;
    temp: string;
    humidity: string;
} {
    return {
        coordValue: snapshot.coordinates ? formatGeoPoint(snapshot.coordinates) : "",
        temp:
            snapshot.temperatureCelsius != null
                ? snapshot.temperatureCelsius.toFixed(1)
                : "",
        humidity:
            snapshot.humidityPct != null ? String(Math.round(snapshot.humidityPct)) : "",
    };
}

/** On-chain: temperatura en centésimas de °C (columna `temperature_centi`). */
export function parseCheckpointTemperatureForChain(input: string): number | null {
    const t = input.trim();
    if (!t) {
        return null;
    }
    const celsius = Number.parseFloat(t);
    if (!Number.isFinite(celsius)) {
        return null;
    }
    return Math.round(celsius * 100);
}

export function parseCheckpointHumidityForChain(input: string): number | null {
    const t = input.trim();
    if (!t) {
        return null;
    }
    const value = Number.parseFloat(t);
    if (!Number.isFinite(value)) {
        return null;
    }
    return Math.min(255, Math.max(0, Math.round(value)));
}

export function temperatureCelsiusToChain(celsius: number): number {
    return Math.round(celsius * 100);
}

export function humidityPctToChain(pct: number): number {
    return Math.min(255, Math.max(0, Math.round(pct)));
}
