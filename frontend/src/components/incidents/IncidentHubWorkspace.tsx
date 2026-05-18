"use client";

import { useMemo, useState } from "react";

import { IncidentHubFiltersPanel } from "@/components/incidents/IncidentHubFilters";
import { IncidentHubRecentTable } from "@/components/incidents/IncidentHubRecentTable";
import { IncidentHubStats } from "@/components/incidents/IncidentHubStats";
import { useIncidentsHub } from "@/lib/api/useIncidentsHub";
import {
    EMPTY_INCIDENT_HUB_FILTERS,
    filterIncidentHubRecent,
    uniqueIncidentSeverities,
    uniqueIncidentSources,
    type IncidentHubFilters,
} from "@/lib/incidents/hubFilters";
import { roleDisplayName } from "@/lib/panel/capabilities";
import { useWalletSession } from "@/lib/wallet/WalletSessionContext";

export type IncidentHubWorkspaceProps = {
    apiBaseUrl: string;
};

export function IncidentHubWorkspace({ apiBaseUrl }: IncidentHubWorkspaceProps) {
    const { wallet, role, actorLoading } = useWalletSession();
    const { data, loading, error, reload } = useIncidentsHub(apiBaseUrl, wallet);
    const [filters, setFilters] = useState<IncidentHubFilters>(EMPTY_INCIDENT_HUB_FILTERS);

    const recent = useMemo(() => data?.recent ?? [], [data]);
    const filtered = useMemo(
        () => filterIncidentHubRecent(recent, filters),
        [recent, filters],
    );
    const severityOptions = useMemo(() => uniqueIncidentSeverities(recent), [recent]);
    const sourceOptions = useMemo(() => uniqueIncidentSources(recent), [recent]);

    return (
        <div className="admin-workspace incident-hub-workspace">
            <header className="admin-page-header">
                <div className="admin-page-header__intro">
                    <h1 className="admin-page-header__title">Centro de incidencias</h1>
                    <p className="admin-page-header__sub">
                        Inteligencia operativa: detecciones automáticas del motor de telemetría y
                        reportes críticos firmados on-chain.
                    </p>
                </div>
                <div className="admin-page-header__meta">
                    {actorLoading ? (
                        <span className="admin-page-header__meta-label">Cargando perfil…</span>
                    ) : (
                        <span className="badge badge--neutral">{roleDisplayName(role)}</span>
                    )}
                    {wallet ? (
                        <span className="admin-page-header__wallet mono" title={wallet}>
                            {wallet.slice(0, 4)}…{wallet.slice(-4)}
                        </span>
                    ) : null}
                </div>
            </header>

            {error ? (
                <p className="text-sm admin-form__err" role="alert">
                    {error}
                </p>
            ) : null}

            <div className="admin-workspace__stack">
                <IncidentHubStats
                    summary={data?.summary ?? null}
                    loading={loading}
                    filteredCount={filtered.length}
                    onRefresh={() => void reload()}
                />

                <IncidentHubFiltersPanel
                    filters={filters}
                    severityOptions={severityOptions}
                    sourceOptions={sourceOptions}
                    resultCount={filtered.length}
                    totalCount={recent.length}
                    onChange={setFilters}
                    onReset={() => setFilters(EMPTY_INCIDENT_HUB_FILTERS)}
                />

                <IncidentHubRecentTable rows={filtered} loading={loading} wallet={wallet ?? ""} />
            </div>
        </div>
    );
}
