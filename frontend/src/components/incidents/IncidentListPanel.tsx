"use client";

import type { IncidentItem } from "@/lib/api/incidents";
import { IncidentCard } from "@/components/incidents/IncidentCard";

export type IncidentListPanelProps = {
    items: IncidentItem[];
    loading?: boolean;
    error?: string | null;
    emptyMessage?: string;
};

export function IncidentListPanel({
    items,
    loading,
    error,
    emptyMessage = "No hay incidencias registradas para este envío.",
}: IncidentListPanelProps) {
    if (loading) {
        return <p className="text-sm text-muted mb-0">Cargando incidencias…</p>;
    }
    if (error) {
        return (
            <p className="text-sm admin-form__err mb-0" role="alert">
                {error}
            </p>
        );
    }
    if (items.length === 0) {
        return (
            <p className="text-sm text-muted mb-0" role="status">
                {emptyMessage}
            </p>
        );
    }
    return (
        <ul className="incident-list">
            {items.map((inc) => (
                <li key={inc.id} className="incident-list__item">
                    <IncidentCard incident={inc} />
                </li>
            ))}
        </ul>
    );
}
