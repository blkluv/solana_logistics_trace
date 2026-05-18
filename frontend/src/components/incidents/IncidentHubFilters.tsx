"use client";

import { incidentSourceLabel } from "@/lib/incidents/display";
import type { IncidentHubFilters } from "@/lib/incidents/hubFilters";

export type IncidentHubFiltersProps = {
    filters: IncidentHubFilters;
    severityOptions: string[];
    sourceOptions: string[];
    resultCount: number;
    totalCount: number;
    onChange: (filters: IncidentHubFilters) => void;
    onReset: () => void;
};

export function IncidentHubFiltersPanel({
    filters,
    severityOptions,
    sourceOptions,
    resultCount,
    totalCount,
    onChange,
    onReset,
}: IncidentHubFiltersProps) {
    return (
        <section className="admin-section admin-search card" aria-labelledby="incident-hub-filters-title">
            <header className="card__hd admin-section__head admin-search__head">
                <div>
                    <h2 id="incident-hub-filters-title" className="admin-section__title">
                        Filtrar incidencias
                    </h2>
                    <p className="admin-section__desc mb-0">
                        {resultCount} resultado{resultCount === 1 ? "" : "s"} de {totalCount} recientes
                    </p>
                </div>
                <button type="button" className="btn btn--ghost btn--sm" onClick={onReset}>
                    Limpiar filtros
                </button>
            </header>
            <div className="card__bd admin-search__fields">
                <div className="admin-search__field form-group mb-0">
                    <label htmlFor="incident-hub-query">Buscar</label>
                    <input
                        id="incident-hub-query"
                        type="search"
                        className="input"
                        placeholder="Tipo, envío, producto, descripción…"
                        value={filters.query}
                        onChange={(e) => onChange({ ...filters, query: e.target.value })}
                    />
                </div>
                <div className="admin-search__field form-group mb-0">
                    <label htmlFor="incident-hub-status">Estado</label>
                    <select
                        id="incident-hub-status"
                        className="select"
                        value={filters.status}
                        onChange={(e) =>
                            onChange({
                                ...filters,
                                status: e.target.value as IncidentHubFilters["status"],
                            })
                        }
                    >
                        <option value="">Todos</option>
                        <option value="Open">Abiertas</option>
                        <option value="Resolved">Resueltas</option>
                    </select>
                </div>
                <div className="admin-search__field form-group mb-0">
                    <label htmlFor="incident-hub-severity">Severidad</label>
                    <select
                        id="incident-hub-severity"
                        className="select"
                        value={filters.severity}
                        onChange={(e) => onChange({ ...filters, severity: e.target.value })}
                    >
                        <option value="">Todas</option>
                        {severityOptions.map((severity) => (
                            <option key={severity} value={severity}>
                                {severity}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="admin-search__field form-group mb-0">
                    <label htmlFor="incident-hub-source">Origen</label>
                    <select
                        id="incident-hub-source"
                        className="select"
                        value={filters.source}
                        onChange={(e) => onChange({ ...filters, source: e.target.value })}
                    >
                        <option value="">Todos</option>
                        {sourceOptions.map((source) => (
                            <option key={source} value={source}>
                                {incidentSourceLabel(source)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </section>
    );
}
