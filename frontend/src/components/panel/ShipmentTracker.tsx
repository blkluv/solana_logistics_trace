"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { getShipmentsForWallet, type ShipmentListItem } from "@/lib/api/shipments";

function statusBadgeClass(status: string): string {
    switch (status) {
        case "Delivered":
            return "badge badge--success";
        case "Cancelled":
            return "badge badge--danger";
        case "OutForDelivery":
            return "badge badge--info";
        default:
            return "badge badge--neutral";
    }
}

export type ShipmentTrackerControlled = {
    rows: ShipmentListItem[] | null;
    loading: boolean;
    error: string | null;
    onReload: () => void | Promise<void>;
};

export type ShipmentTrackerProps = {
    apiBaseUrl: string;
    wallet: string;
    /** Genera enlace al detalle (por defecto `/envios/:id?wallet=`). */
    detailHref?: (shipmentId: string, rowWallet: string) => string;
    /** Título del bloque (por defecto: seguimiento de envíos). */
    title?: string;
    /** Controles extra junto a «Actualizar» (p. ej. «Nuevo envío»). */
    headerActions?: ReactNode;
    /** Datos ya cargados por el padre (evita doble petición). */
    controlled?: ShipmentTrackerControlled;
};

export function ShipmentTracker({
    apiBaseUrl,
    wallet,
    detailHref,
    title,
    headerActions,
    controlled,
}: ShipmentTrackerProps) {
    const [rows, setRows] = useState<ShipmentListItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const hrefFor =
        detailHref ??
        ((id: string, w: string) => `/envios/${encodeURIComponent(id)}?wallet=${encodeURIComponent(w)}`);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getShipmentsForWallet(apiBaseUrl, wallet);
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
    }, [apiBaseUrl, wallet]);

    useEffect(() => {
        if (controlled) {
            return;
        }
        void Promise.resolve().then(() => void load());
    }, [controlled, load]);

    const displayRows = controlled ? controlled.rows : rows;
    const displayLoading = controlled ? controlled.loading : loading;
    const displayError = controlled ? controlled.error : error;
    const reload = controlled ? () => void controlled.onReload() : () => void load();

    const blockTitle = title ?? "Seguimiento de envíos";

    return (
        <div className="panel-etapa2-tracker" data-testid="shipment-tracker">
            <div className="panel-etapa2-tracker__hd">
                <h2 className="panel-etapa2-title">{blockTitle}</h2>
                <div className="panel-etapa2-tracker__actions">
                    {headerActions}
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => void reload()}>
                        Actualizar
                    </button>
                </div>
            </div>
            {displayLoading && <p className="text-muted text-sm">Cargando…</p>}
            {displayError && <p className="text-sm" role="alert">{displayError}</p>}
            {!displayLoading && displayRows && displayRows.length === 0 && (
                <p className="text-muted text-sm">No hay envíos para esta wallet.</p>
            )}
            {displayRows && displayRows.length > 0 && (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>On-chain</th>
                                <th>Producto</th>
                                <th>Estado</th>
                                <th>Creado</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayRows.map((r) => (
                                <tr key={r.shipmentId}>
                                    <td className="mono text-sm">{r.shipmentId.slice(0, 8)}…</td>
                                    <td className="mono text-sm">{r.onChainShipmentId}</td>
                                    <td>{r.product}</td>
                                    <td>
                                        <span className={statusBadgeClass(r.status)}>{r.status}</span>
                                    </td>
                                    <td className="text-sm text-muted">{r.createdAt}</td>
                                    <td>
                                        <Link
                                            prefetch={false}
                                            className="btn btn--ghost btn--sm"
                                            href={hrefFor(r.shipmentId, wallet)}
                                        >
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
