"use client";

import { useCallback, useEffect, useState } from "react";

import { getIncidentsHub, type IncidentHubData } from "@/lib/api/incidentsHub";

export function useIncidentsHub(apiBaseUrl: string | undefined, wallet: string | null) {
    const [data, setData] = useState<IncidentHubData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        const base = apiBaseUrl?.trim();
        if (!base || !wallet) {
            setData(null);
            setError(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await getIncidentsHub(base, wallet);
            if (res.ok) {
                setData(res.data);
            } else {
                setData(null);
                setError(
                    res.status === 404
                        ? "No se encontraron datos de incidencias."
                        : `No se pudo cargar el centro de incidencias (HTTP ${res.status}).`,
                );
            }
        } catch (e) {
            setData(null);
            setError(e instanceof Error ? e.message : "Error de red");
        } finally {
            setLoading(false);
        }
    }, [apiBaseUrl, wallet]);

    useEffect(() => {
        void Promise.resolve().then(() => void reload());
    }, [reload]);

    return { data, loading, error, reload };
}
