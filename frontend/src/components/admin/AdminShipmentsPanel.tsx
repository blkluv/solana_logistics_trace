"use client";

import {
    AdminShipmentCard,
    adminShipmentDetailHref,
} from "@/components/admin/AdminShipmentCard";
import { canCreateShipmentAction } from "@/lib/admin/shipmentActions";
import type { ShipmentListItem } from "@/lib/api/shipments";

export type AdminShipmentsPanelProps = {
    rows: ShipmentListItem[];
    loading: boolean;
    role: string | null;
    programActive: boolean;
    actorOnChain: boolean;
    hasWallet: boolean;
    onRecordEvent: (shipmentId: string) => void;
    onCreateShipment: () => void;
};

export function AdminShipmentsPanel({
    rows,
    loading,
    role,
    programActive,
    actorOnChain,
    hasWallet,
    onRecordEvent,
    onCreateShipment,
}: AdminShipmentsPanelProps) {
    const createAction = canCreateShipmentAction({
        role,
        hasWallet,
        programActive,
        actorOnChain,
    });

    return (
        <section className="admin-shipments-panel" aria-labelledby="admin-shipments-title">
            <header className="admin-shipments-panel__hd">
                <div>
                    <h2 id="admin-shipments-title" className="admin-shipments-panel__title">
                        Envíos
                    </h2>
                    <p className="text-sm text-muted mb-0">
                        Acciones disponibles según su rol en cada envío.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    disabled={!createAction.enabled}
                    title={createAction.reason}
                    onClick={onCreateShipment}
                >
                    Registrar envío
                </button>
            </header>

            {loading ? (
                <p className="text-sm text-muted">Cargando envíos…</p>
            ) : rows.length === 0 ? (
                <div className="admin-shipments-panel__empty card">
                    <div className="card__bd text-sm text-muted">
                        <p className="mb-0">
                            No hay envíos que coincidan con los filtros. Ajuste la búsqueda o
                            registre un nuevo envío si es remitente (Sender).
                        </p>
                    </div>
                </div>
            ) : (
                <div className="admin-shipments-panel__grid" data-testid="admin-shipments-grid">
                    {rows.map((shipment) => (
                        <AdminShipmentCard
                            key={shipment.shipmentId}
                            shipment={shipment}
                            role={role}
                            programActive={programActive}
                            actorOnChain={actorOnChain}
                            hasWallet={hasWallet}
                            detailHref={adminShipmentDetailHref(shipment.shipmentId)}
                            onRecordEvent={onRecordEvent}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
