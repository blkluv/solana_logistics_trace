"use client";

import Link from "next/link";

import type { IncidentHubRecentItem } from "@/lib/api/incidentsHub";
import {
    incidentSeverityClass,
    incidentSeverityLabel,
    incidentSourceLabel,
    incidentTypeLabel,
} from "@/lib/incidents/display";
import { statusBadgeClass } from "@/lib/shipments/display";

export type IncidentHubRecentTableProps = {
    rows: IncidentHubRecentItem[];
    loading: boolean;
    wallet: string;
};

export function IncidentHubRecentTable({ rows, loading, wallet }: IncidentHubRecentTableProps) {
    const shipmentHref = (shipmentId: string) =>
        `/panel/envios/${encodeURIComponent(shipmentId)}?wallet=${encodeURIComponent(wallet)}`;

    return (
        <section className="admin-section incident-hub-recent" aria-labelledby="incident-hub-recent-title">
            <header className="admin-section__head">
                <div>
                    <h2 id="incident-hub-recent-title" className="admin-section__title">
                        Incidencias recientes
                    </h2>
                    <p className="admin-section__desc">
                        Últimas detecciones automáticas y reportes críticos firmados on-chain.
                    </p>
                </div>
            </header>

            {loading ? (
                <p className="text-sm text-muted">Cargando listado…</p>
            ) : rows.length === 0 ? (
                <div className="card incident-hub-recent__empty">
                    <div className="card__bd">
                        <p className="admin-section__desc mb-0">
                            No hay incidencias que coincidan con los filtros. El motor genera alertas cuando
                            la telemetría supera umbrales configurados.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="card incident-hub-recent__table-card">
                    <div className="table-wrap">
                        <table className="data-table incident-hub-table">
                            <thead>
                                <tr>
                                    <th>Incidencia</th>
                                    <th>Envío</th>
                                    <th>Severidad</th>
                                    <th>Estado</th>
                                    <th>Origen</th>
                                    <th>Detectada</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id}>
                                        <td>
                                            <p className="incident-hub-table__type mb-0">
                                                {incidentTypeLabel(row.incidentType)}
                                            </p>
                                            <p className="text-xs text-muted mb-0 line-clamp-2">
                                                {row.description || "—"}
                                            </p>
                                        </td>
                                        <td>
                                            <p className="incident-hub-table__product mb-1">
                                                {row.shipmentProduct}
                                            </p>
                                            <span className={statusBadgeClass(row.shipmentStatus)}>
                                                {row.shipmentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={incidentSeverityClass(row.severity)}>
                                                {incidentSeverityLabel(row.severity)}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={
                                                    row.status === "Open"
                                                        ? "badge badge--warn"
                                                        : "badge badge--success"
                                                }
                                            >
                                                {row.status === "Open" ? "Abierta" : "Resuelta"}
                                            </span>
                                        </td>
                                        <td className="text-sm">
                                            {incidentSourceLabel(row.source)}
                                        </td>
                                        <td className="text-sm">
                                            {new Date(row.detectedAt).toLocaleString()}
                                        </td>
                                        <td>
                                            <Link
                                                prefetch={false}
                                                className="btn btn--primary btn--sm"
                                                href={shipmentHref(row.shipmentId)}
                                            >
                                                Ver envío
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}
