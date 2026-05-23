"use client";

import { useCallback, useEffect, useState } from "react";

import { getShipmentTelemetry } from "@/lib/api/telemetry";

import { buildMeterSnapshot, type MeterSnapshot } from "./meterSnapshot";

function isAbortError(e: unknown): boolean {
    if (e instanceof DOMException && e.name === "AbortError") {
        return true;
    }
    if (e instanceof Error) {
        return e.name === "AbortError" || e.message.toLowerCase().includes("aborted");
    }
    return false;
}

export function useMeterSnapshot(
    apiBaseUrl: string | undefined,
    shipmentId: string | undefined,
    wallet: string | null,
) {
    const [snapshot, setSnapshot] = useState<MeterSnapshot | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async (): Promise<MeterSnapshot | null> => {
        const base = apiBaseUrl?.trim();
        const id = shipmentId?.trim();
        if (!base || !id || !wallet) {
            setSnapshot(null);
            setError(null);
            setLoading(false);
            return null;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await getShipmentTelemetry(base, id, wallet);
            if (!res.ok) {
                if (res.status === 404 || res.status === 501) {
                    setSnapshot(null);
                    setError(null);
                    return null;
                }
                setSnapshot(null);
                setError(`No se pudieron cargar medidores (HTTP ${res.status}).`);
                return null;
            }
            const built = buildMeterSnapshot(res.data);
            setSnapshot(built);
            return built;
        } catch (e) {
            if (isAbortError(e)) {
                return null;
            }
            setSnapshot(null);
            setError(e instanceof Error ? e.message : "Error al cargar medidores");
            return null;
        } finally {
            setLoading(false);
        }
    }, [apiBaseUrl, shipmentId, wallet]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return { snapshot, loading, error, refresh };
}
