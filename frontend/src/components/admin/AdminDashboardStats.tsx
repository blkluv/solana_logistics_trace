"use client";

import type { ShipmentDashboardStats } from "@/lib/admin/shipmentFilters";

export type AdminDashboardStatsProps = {
    stats: ShipmentDashboardStats | null;
    loading: boolean;
    filteredCount: number;
    onRefresh: () => void;
};

function kpiValue(loading: boolean, value: number | null): string {
    if (loading) {
        return "…";
    }
    return value === null ? "—" : String(value);
}

export function AdminDashboardStats({
    stats,
    loading,
    filteredCount,
    onRefresh,
}: AdminDashboardStatsProps) {
    return (
        <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
            <div className="admin-dashboard__hd">
                <div>
                    <h2 id="admin-dashboard-title" className="admin-dashboard__title">
                        Resumen
                    </h2>
                    <p className="text-sm text-muted mb-0">
                        {loading
                            ? "Cargando métricas…"
                            : `Mostrando ${filteredCount} de ${stats?.total ?? 0} envíos visibles`}
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    Actualizar
                </button>
            </div>
            <div className="kpi-grid admin-dashboard__kpis">
                <div className="kpi">
                    <div className="kpi__label">Total envíos</div>
                    <div className="kpi__value">{kpiValue(loading, stats?.total ?? null)}</div>
                    <div className="kpi__meta">Asociados a su cartera</div>
                </div>
                <div className="kpi">
                    <div className="kpi__label">En curso</div>
                    <div className="kpi__value">{kpiValue(loading, stats?.inProgress ?? null)}</div>
                    <div className="kpi__meta">Activos (no entregados ni cancelados)</div>
                </div>
                <div className="kpi">
                    <div className="kpi__label">Entregados</div>
                    <div className="kpi__value">{kpiValue(loading, stats?.delivered ?? null)}</div>
                    <div className="kpi__meta">Estado Delivered</div>
                </div>
                <div className="kpi">
                    <div className="kpi__label">Cadena de frío</div>
                    <div className="kpi__value">{kpiValue(loading, stats?.coldChain ?? null)}</div>
                    <div className="kpi__meta">Requieren temperatura controlada</div>
                </div>
            </div>
        </section>
    );
}
