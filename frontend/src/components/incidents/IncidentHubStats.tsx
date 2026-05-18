"use client";

import type { IncidentHubSummary } from "@/lib/api/incidentsHub";

export type IncidentHubStatsProps = {
    summary: IncidentHubSummary | null;
    loading: boolean;
    filteredCount: number;
    onRefresh: () => void;
};

type StatItem = {
    id: string;
    label: string;
    hint: string;
    value: number | null;
    tone: "total" | "open" | "critical" | "resolved" | "auto" | "onchain" | "shipments" | "monitoring";
};

function kpiValue(loading: boolean, value: number | null): string {
    if (loading) {
        return "—";
    }
    return value === null ? "0" : String(value);
}

export function IncidentHubStats({
    summary,
    loading,
    filteredCount,
    onRefresh,
}: IncidentHubStatsProps) {
    const items: StatItem[] = [
        {
            id: "total",
            label: "Total incidencias",
            hint: "En su ámbito operativo",
            value: summary?.totalIncidents ?? null,
            tone: "total",
        },
        {
            id: "open",
            label: "Abiertas",
            hint: "Requieren seguimiento",
            value: summary?.openIncidents ?? null,
            tone: "open",
        },
        {
            id: "critical",
            label: "Críticas abiertas",
            hint: "Severidad Critical",
            value: summary?.criticalOpen ?? null,
            tone: "critical",
        },
        {
            id: "resolved",
            label: "Resueltas",
            hint: "Cierre operativo",
            value: summary?.resolvedIncidents ?? null,
            tone: "resolved",
        },
        {
            id: "auto",
            label: "Detecciones auto",
            hint: "Motor de telemetría",
            value: summary?.autoDetections ?? null,
            tone: "auto",
        },
        {
            id: "onchain",
            label: "Reportes on-chain",
            hint: "Firmados en Solana",
            value: summary?.onChainReports ?? null,
            tone: "onchain",
        },
        {
            id: "shipments",
            label: "Envíos afectados",
            hint: "Con al menos una incidencia",
            value: summary?.shipmentsWithIncidents ?? null,
            tone: "shipments",
        },
        {
            id: "monitoring",
            label: "Monitoreo activo",
            hint: "Motor de reglas en curso",
            value: summary?.activeMonitoring ?? null,
            tone: "monitoring",
        },
    ];

    return (
        <section className="admin-section incident-hub-dashboard" aria-labelledby="incident-hub-stats-title">
            <header className="admin-section__head">
                <div>
                    <h2 id="incident-hub-stats-title" className="admin-section__title">
                        Indicadores
                    </h2>
                    <p className="admin-section__desc">
                        {loading
                            ? "Cargando métricas de inteligencia operativa…"
                            : `Actividad reciente · ${filteredCount} incidencia${filteredCount === 1 ? "" : "s"} en el listado filtrado`}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    Actualizar
                </button>
            </header>
            <div className="admin-stat-grid incident-hub-stat-grid" role="list">
                {items.map((item) => (
                    <article
                        key={item.id}
                        className={`admin-stat admin-stat--${item.tone}`}
                        role="listitem"
                        aria-busy={loading}
                    >
                        <span className="admin-stat__label">{item.label}</span>
                        <span className="admin-stat__value">{kpiValue(loading, item.value)}</span>
                        <span className="admin-stat__hint">{item.hint}</span>
                    </article>
                ))}
            </div>
        </section>
    );
}
