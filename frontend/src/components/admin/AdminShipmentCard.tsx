"use client";

import Link from "next/link";

import {
    shipmentCardActions,
    statusBadgeClass,
} from "@/lib/admin/shipmentActions";
import type { ShipmentListItem } from "@/lib/api/shipments";

export type AdminShipmentCardProps = {
    shipment: ShipmentListItem;
    role: string | null;
    programActive: boolean;
    actorOnChain: boolean;
    hasWallet: boolean;
    detailHref: string;
    onRecordEvent: (shipmentId: string) => void;
};

export function AdminShipmentCard({
    shipment,
    role,
    programActive,
    actorOnChain,
    hasWallet,
    detailHref,
    onRecordEvent,
}: AdminShipmentCardProps) {
    const actions = shipmentCardActions({
        role,
        hasWallet,
        programActive,
        actorOnChain,
    });
    const recordAction = actions.find((a) => a.id === "record_event");

    return (
        <article
            className="admin-shipment-card card"
            data-testid={`admin-shipment-card-${shipment.shipmentId}`}
        >
            <div className="card__bd admin-shipment-card__bd">
                <div className="admin-shipment-card__hd">
                    <span className={statusBadgeClass(shipment.status)}>{shipment.status}</span>
                    <span className="text-xs text-muted mono">#{shipment.onChainShipmentId}</span>
                </div>
                <h3 className="admin-shipment-card__title">{shipment.product}</h3>
                <p className="text-sm text-muted mb-2">
                    {shipment.requiresColdChain ? "Cadena de frío" : "Estándar"} ·{" "}
                    <time dateTime={shipment.createdAt}>{shipment.createdAt}</time>
                </p>
                <div className="admin-shipment-card__actions">
                    <Link
                        prefetch={false}
                        className="btn btn--ghost btn--sm"
                        href={detailHref}
                    >
                        Ver detalle
                    </Link>
                    {recordAction ? (
                        <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            disabled={!recordAction.enabled}
                            title={recordAction.reason}
                            onClick={() => onRecordEvent(shipment.shipmentId)}
                        >
                            {recordAction.label}
                        </button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}

export function adminShipmentDetailHref(shipmentId: string): string {
    return `/admin/envios/${encodeURIComponent(shipmentId)}`;
}
