"use client";

import { useCallback, useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getCarrierActors, type CarrierOption } from "@/lib/api/actors";
import { postAssignCarrierSync } from "@/lib/api/sync";
import { postSyncWithRetry } from "@/lib/api/syncWithRetry";
import { userFacingChainError, userMessageForSyncFailure } from "@/lib/panel/etapa1UserMessages";
import { createAssignCarrierIx } from "@/lib/solana/instructions";
import { confirmSerializedTx } from "@/lib/solana/confirmSerializedTx";

export type AssignCarrierFormProps = {
    apiBaseUrl: string;
    connection: Connection;
    programId: PublicKey;
    sender: PublicKey;
    shipmentPda: PublicKey;
    onSuccess?: () => void;
};

export function AssignCarrierForm({
    apiBaseUrl,
    connection,
    programId,
    sender,
    shipmentPda,
    onSuccess,
}: AssignCarrierFormProps) {
    const [carriers, setCarriers] = useState<CarrierOption[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [selected, setSelected] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoadingList(true);
        void getCarrierActors(apiBaseUrl).then((res) => {
            if (cancelled) {
                return;
            }
            if (res.ok) {
                setCarriers(res.data);
            } else {
                setError("No se pudo cargar la lista de transportistas.");
            }
            setLoadingList(false);
        });
        return () => {
            cancelled = true;
        };
    }, [apiBaseUrl]);

    const onSubmit = useCallback(async () => {
        if (!selected) {
            setError("Seleccione un transportista registrado.");
            return;
        }
        setBusy(true);
        setError(null);
        setStatus("Firmando asignación on-chain…");
        try {
            const carrierPk = new PublicKey(selected);
            const ix = createAssignCarrierIx({
                programId,
                sender,
                shipment: shipmentPda,
                carrier: carrierPk,
            });
            const sig = await confirmSerializedTx(connection, sender, ix);

            setStatus("Sincronizando con el backend…");
            const sync = await postSyncWithRetry(() =>
                postAssignCarrierSync(apiBaseUrl, { tx_hash: sig }),
            );
            if (!sync.ok) {
                throw new Error(
                    userMessageForSyncFailure(
                        "la asignación de transportista",
                        sync.status,
                        sync.json,
                    ),
                );
            }

            setStatus("Transportista asignado.");
            onSuccess?.();
        } catch (e) {
            setError(userFacingChainError("assign_carrier", e));
            setStatus(null);
        } finally {
            setBusy(false);
        }
    }, [apiBaseUrl, connection, onSuccess, programId, selected, sender, shipmentPda]);

    return (
        <div className="assign-carrier-form">
            <p className="assign-carrier-form__intro text-sm text-muted">
                Solo usted como remitente puede asignar un Carrier registrado en la red. La operación
                queda registrada on-chain.
            </p>
            {loadingList ? (
                <p className="text-sm text-muted">Cargando transportistas…</p>
            ) : carriers.length === 0 ? (
                <p className="text-sm text-muted" role="status">
                    No hay actores Carrier activos. Registre transportistas en{" "}
                    <code>/registro</code> antes de asignar.
                </p>
            ) : (
                <div className="form-group assign-carrier-form__field">
                    <label htmlFor="assign-carrier-select">Transportista</label>
                    <select
                        id="assign-carrier-select"
                        className="select"
                        value={selected}
                        disabled={busy}
                        onChange={(e) => setSelected(e.target.value)}
                    >
                        <option value="">— Seleccione —</option>
                        {carriers.map((c) => (
                            <option key={c.wallet} value={c.wallet}>
                                {c.displayLabel}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {error ? (
                <p className="text-sm assign-carrier-form__feedback" role="alert">
                    {error}
                </p>
            ) : null}
            {status ? (
                <p className="text-sm text-muted assign-carrier-form__feedback" role="status">
                    {status}
                </p>
            ) : null}
            <div className="assign-carrier-form__actions">
                <button
                    type="button"
                    className="btn btn--primary"
                    disabled={busy || loadingList || carriers.length === 0 || !selected}
                    onClick={() => void onSubmit()}
                >
                    {busy ? "Procesando…" : "Asignar on-chain"}
                </button>
            </div>
        </div>
    );
}
