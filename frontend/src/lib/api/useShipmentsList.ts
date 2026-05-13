"use client";

import { useCallback, useEffect, useState } from "react";

import { getShipmentsForWallet, type ShipmentListItem } from "@/lib/api/shipments";

/**
 * Listado `GET /shipments?wallet=` para la wallet conectada (panel / dashboard).
 */
export function useShipmentsList(apiBaseUrl: string | undefined, wallet: string | null) {
    const base = apiBaseUrl?.trim() ?? "";
    const [rows, setRows] = useState<ShipmentListItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!base || !wallet) {
            setRows(null);
            setError(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await getShipmentsForWallet(base, wallet);
            if (!res.ok) {
                setRows(null);
                setError(`HTTP ${res.status}`);
                return;
            }
            setRows(res.data);
        } catch (e) {
            setRows(null);
            setError(e instanceof Error ? e.message : "Error de red");
        } finally {
            setLoading(false);
        }
    }, [base, wallet]);

    useEffect(() => {
        void Promise.resolve().then(() => void load());
    }, [load]);

    return { rows, error, loading, reload: load };
}
