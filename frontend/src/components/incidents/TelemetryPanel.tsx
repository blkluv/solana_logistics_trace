"use client";

import type { TelemetryEventItem } from "@/lib/api/telemetry";

export type TelemetryPanelProps = {
    items: TelemetryEventItem[];
    loading: boolean;
    error: string | null;
    unavailable?: boolean;
};

function telemetryTypeLabel(code: string): string {
    const map: Record<string, string> = {
        temperature: "Temperatura",
        gps: "Posición GPS",
        humidity: "Humedad",
    };
    return map[code] ?? code;
}

function formatValue(item: TelemetryEventItem): string {
    if (item.valueNumeric !== null) {
        if (item.telemetryType === "temperature") {
            return `${(item.valueNumeric / 100).toFixed(1)} °C`;
        }
        return String(item.valueNumeric);
    }
    if (item.latitude !== null && item.longitude !== null) {
        return `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`;
    }
    return "—";
}

export function TelemetryPanel({ items, loading, error, unavailable }: TelemetryPanelProps) {
    if (loading) {
        return <p className="text-sm text-muted mb-0">Cargando telemetría…</p>;
    }
    if (error) {
        return (
            <p className="text-sm mb-0" role="alert">
                {error}
            </p>
        );
    }
    if (unavailable) {
        return (
            <p className="text-sm text-muted mb-0" role="status">
                Telemetría en preparación: el endpoint GET aún no está disponible en el backend.
            </p>
        );
    }
    if (items.length === 0) {
        return (
            <p className="text-sm text-muted mb-0" role="status">
                Sin lecturas recientes. El motor genera eventos mientras el monitoreo está activo.
            </p>
        );
    }

    return (
        <div className="telemetry-panel">
            <div className="table-wrap">
                <table className="data-table telemetry-panel__table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Valor</th>
                            <th>Registrado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.slice(0, 12).map((row) => (
                            <tr key={row.id}>
                                <td>{telemetryTypeLabel(row.telemetryType)}</td>
                                <td className="mono">{formatValue(row)}</td>
                                <td>{new Date(row.recordedAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
