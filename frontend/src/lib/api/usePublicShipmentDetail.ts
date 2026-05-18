"use client";

import { useCallback, useEffect, useState } from "react";

import {
    getPublicShipmentDetail,
    publicShipmentLookupError,
} from "@/lib/api/publicShipments";
import type { ShipmentDetail } from "@/lib/api/shipments";

/**
 * Detalle público `GET /public/shipments/:id` — solo UUID del servicio.
 */
export function usePublicShipmentDetail(apiBaseUrl: string | undefined, shipmentId: string) {
    const base = apiBaseUrl?.trim() ?? "";
    const id = shipmentId.trim();
    const [detail, setDetail] = useState<ShipmentDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!base || !id) {
            setDetail(null);
            setError(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await getPublicShipmentDetail(base, id);
            if (!res.ok) {
                setDetail(null);
                setError(publicShipmentLookupError(res.status, res.body));
                return;
            }
            setDetail(res.data);
        } catch (e) {
            setDetail(null);
            setError(e instanceof Error ? e.message : "Error de red");
        } finally {
            setLoading(false);
        }
    }, [base, id]);

    useEffect(() => {
        void Promise.resolve().then(() => void load());
    }, [load]);

    return { detail, error, loading, reload: load };
}
