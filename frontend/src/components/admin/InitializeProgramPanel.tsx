"use client";

import { useCallback, useState } from "react";
import type { Connection, PublicKey } from "@solana/web3.js";

import { adminHints, userFacingChainError } from "@/lib/panel/etapa1UserMessages";
import { confirmSerializedTx } from "@/lib/solana/confirmSerializedTx";
import { createInitializeIx } from "@/lib/solana/instructions";

export type InitializeProgramPanelProps = {
    connection: Connection;
    programId: PublicKey;
    payer: PublicKey;
    programActive: boolean;
    onSuccess: () => void;
};

export function InitializeProgramPanel({
    connection,
    programId,
    payer,
    programActive,
    onSuccess,
}: InitializeProgramPanelProps) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

    const onActivate = useCallback(async () => {
        if (programActive) {
            return;
        }
        setBusy(true);
        setMessage(null);
        try {
            await confirmSerializedTx(
                connection,
                payer,
                createInitializeIx({ programId, authority: payer }),
            );
            setMessage({ kind: "ok", text: "Programa activado correctamente en esta red." });
            onSuccess();
        } catch (e) {
            const m = e instanceof Error ? e.message : String(e);
            setMessage({ kind: "err", text: userFacingChainError("initialize", m) });
        } finally {
            setBusy(false);
        }
    }, [connection, payer, programId, programActive, onSuccess]);

    if (programActive) {
        return (
            <p className="text-sm text-muted mb-0">
                El programa ya está activo en esta red. Puede continuar con el alta de actor.
            </p>
        );
    }

    return (
        <div>
            <p className="text-sm text-muted mb-2">
                Ejecución única por despliegue en la red configurada. Requiere firma con Phantom.
            </p>
            <button
                type="button"
                className={`btn btn--primary${busy ? " is-busy" : ""}`}
                disabled={busy}
                aria-busy={busy}
                onClick={() => void onActivate()}
            >
                {busy ? "Firmando…" : "Activar programa"}
            </button>
            {!programId ? (
                <p className="form-action-hint text-sm text-muted mt-2 mb-0">
                    {adminHints.programNotConfigured}
                </p>
            ) : null}
            {message ? (
                <p
                    className={`text-sm mt-2 mb-0${message.kind === "err" ? " admin-form__err" : ""}`}
                    role={message.kind === "err" ? "alert" : "status"}
                >
                    {message.text}
                </p>
            ) : null}
        </div>
    );
}
