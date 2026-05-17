"use client";

import { useCallback, useRef, useState } from "react";
import type { Connection, PublicKey } from "@solana/web3.js";
import { PublicKey as PK } from "@solana/web3.js";

import { postShipmentsSync } from "@/lib/api/sync";
import {
    recipientFieldValidationError,
    syncSuccessCopy,
    userFacingChainError,
    userMessageForSyncFailure,
} from "@/lib/panel/etapa1UserMessages";
import { confirmSerializedTx } from "@/lib/solana/confirmSerializedTx";
import { createCreateShipmentIx } from "@/lib/solana/instructions";
import { fetchProgramConfig } from "@/lib/solana/program_config";

export type CreateShipmentFormProps = {
    connection: Connection;
    programId: PublicKey;
    payer: PublicKey;
    apiBaseUrl: string;
    onSuccess: () => void;
};

export function CreateShipmentForm({
    connection,
    programId,
    payer,
    apiBaseUrl,
    onSuccess,
}: CreateShipmentFormProps) {
    const [recipient, setRecipient] = useState("");
    const [recipientIssue, setRecipientIssue] = useState<string | null>(null);
    const recipientRef = useRef<HTMLInputElement>(null);
    const [product, setProduct] = useState("");
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [coldChain, setColdChain] = useState(false);
    const [busy, setBusy] = useState(false);
    const [banner, setBanner] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(
        null,
    );

    const onSubmit = useCallback(async () => {
        const trimmedRec = recipient.trim();
        const recErr = recipientFieldValidationError(trimmedRec);
        if (recErr) {
            setRecipientIssue(recErr);
            recipientRef.current?.focus();
            return;
        }
        setBusy(true);
        setBanner(null);
        try {
            const cur = await fetchProgramConfig(connection, programId);
            if (!cur) {
                throw new Error("Programa no activo");
            }
            const rec = new PK(trimmedRec);
            const nextId = cur.decoded.shipmentsCreated + BigInt(1);
            const ix = createCreateShipmentIx({
                programId,
                sender: payer,
                recipient: rec,
                nextShipmentIndex: nextId,
                product: product.trim(),
                origin: origin.trim(),
                destination: destination.trim(),
                requiresColdChain: coldChain,
            });
            const sig = await confirmSerializedTx(connection, payer, ix);
            if (apiBaseUrl.trim()) {
                const r = await postShipmentsSync(apiBaseUrl, { tx_hash: sig });
                if (r.ok) {
                    setBanner({ kind: "ok", text: syncSuccessCopy.shipment });
                } else {
                    setBanner({
                        kind: "err",
                        text: userMessageForSyncFailure("el envío", r.status, r.json),
                    });
                }
            } else {
                setBanner({
                    kind: "info",
                    text: "Envío registrado en cadena. Configure la API para sincronizar.",
                });
            }
            onSuccess();
        } catch (e) {
            const m = e instanceof Error ? e.message : String(e);
            setBanner({ kind: "err", text: userFacingChainError("create_shipment", m) });
        } finally {
            setBusy(false);
        }
    }, [
        connection,
        programId,
        payer,
        recipient,
        product,
        origin,
        destination,
        coldChain,
        apiBaseUrl,
        onSuccess,
    ]);

    const disabled =
        busy ||
        !product.trim() ||
        !origin.trim() ||
        !destination.trim() ||
        recipientFieldValidationError(recipient.trim()) !== null;

    return (
        <form
            className="admin-form"
            onSubmit={(e) => {
                e.preventDefault();
                void onSubmit();
            }}
        >
            <div className="form-group">
                <label htmlFor="admin-ship-rec">Destinatario (wallet)</label>
                <input
                    ref={recipientRef}
                    id="admin-ship-rec"
                    className={`input mono${recipientIssue ? " is-invalid" : ""}`}
                    value={recipient}
                    onChange={(e) => {
                        setRecipient(e.target.value);
                        setRecipientIssue(null);
                    }}
                    onBlur={() => {
                        const t = recipient.trim();
                        setRecipientIssue(t ? recipientFieldValidationError(t) : null);
                    }}
                    placeholder="Clave pública del receptor"
                />
                {recipientIssue ? (
                    <p className="text-sm admin-form__err" role="alert">
                        {recipientIssue}
                    </p>
                ) : null}
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="admin-ship-prod">Producto</label>
                    <input
                        id="admin-ship-prod"
                        className="input"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="admin-ship-cold">Cadena de frío</label>
                    <select
                        id="admin-ship-cold"
                        className="select"
                        value={coldChain ? "1" : "0"}
                        onChange={(e) => setColdChain(e.target.value === "1")}
                    >
                        <option value="0">No</option>
                        <option value="1">Sí</option>
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="admin-ship-orig">Origen</label>
                <input
                    id="admin-ship-orig"
                    className="input"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label htmlFor="admin-ship-dest">Destino</label>
                <input
                    id="admin-ship-dest"
                    className="input"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                />
            </div>
            <button
                type="submit"
                className={`btn btn--primary btn--block${busy ? " is-busy" : ""}`}
                disabled={disabled}
                aria-busy={busy}
            >
                {busy ? "Firmando…" : "Registrar envío"}
            </button>
            {banner ? (
                <p
                    className={`text-sm mt-2 mb-0${banner.kind === "err" ? " admin-form__err" : ""}`}
                    role={banner.kind === "err" ? "alert" : "status"}
                >
                    {banner.text}
                </p>
            ) : null}
        </form>
    );
}
