"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { ShipmentTracker } from "@/components/panel/ShipmentTracker";
import { getPublicConfig } from "@/lib/env";

type SearchMode = "sender" | "id";

export default function PublicEnviosPage() {
    const router = useRouter();
    const { apiBaseUrl } = getPublicConfig();
    const [mode, setMode] = useState<SearchMode>("sender");
    const [senderInput, setSenderInput] = useState("");
    const [listWallet, setListWallet] = useState<string | null>(null);
    const [shipmentIdInput, setShipmentIdInput] = useState("");
    const [participantWallet, setParticipantWallet] = useState("");

    const onSearchBySender = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const w = senderInput.trim();
            setListWallet(w.length > 0 ? w : null);
        },
        [senderInput],
    );

    const onOpenById = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const id = shipmentIdInput.trim();
            const w = participantWallet.trim();
            if (!id || !w) {
                return;
            }
            router.push(`/envios/${encodeURIComponent(id)}?wallet=${encodeURIComponent(w)}`);
        },
        [router, shipmentIdInput, participantWallet],
    );

    return (
        <main className="page-main">
            <div className="shell">
                <div className="content-narrow">
                    <h1 className="page-title">Consulta pública de envíos</h1>
                    <p className="page-sub">
                        Busque por wallet del remitente (listado) o por UUID del envío junto con una
                        wallet participante autorizada en el backend.
                    </p>

                    {!apiBaseUrl && (
                        <p className="text-muted text-sm" role="status">
                            Configure <code className="mono">NEXT_PUBLIC_API_BASE_URL</code>.
                        </p>
                    )}

                    <div className="card mt-2">
                        <div className="card__hd">Criterios</div>
                        <div className="card__bd">
                            <div className="segmented" role="tablist" aria-label="Modo de búsqueda">
                                <button
                                    type="button"
                                    className={mode === "sender" ? "is-active" : ""}
                                    onClick={() => setMode("sender")}
                                >
                                    Por remitente
                                </button>
                                <button
                                    type="button"
                                    className={mode === "id" ? "is-active" : ""}
                                    onClick={() => setMode("id")}
                                >
                                    Por ID de envío
                                </button>
                            </div>

                            {mode === "sender" ? (
                                <form className="mt-2" onSubmit={onSearchBySender}>
                                    <div className="form-group">
                                        <label htmlFor="sender-wallet">Wallet del remitente (base58)</label>
                                        <input
                                            id="sender-wallet"
                                            className="input mono"
                                            autoComplete="off"
                                            placeholder="Clave pública de 32 bytes en base58"
                                            value={senderInput}
                                            onChange={(e) => setSenderInput(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn--primary btn--sm">
                                        Consultar listado
                                    </button>
                                </form>
                            ) : (
                                <form className="mt-2" onSubmit={onOpenById}>
                                    <div className="form-group">
                                        <label htmlFor="ship-id">UUID del envío</label>
                                        <input
                                            id="ship-id"
                                            className="input mono"
                                            autoComplete="off"
                                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                            value={shipmentIdInput}
                                            onChange={(e) => setShipmentIdInput(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="part-wallet">Wallet participante</label>
                                        <input
                                            id="part-wallet"
                                            className="input mono"
                                            autoComplete="off"
                                            placeholder="Requerida por la API para leer el detalle"
                                            value={participantWallet}
                                            onChange={(e) => setParticipantWallet(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn--primary btn--sm">
                                        Ver detalle y línea de tiempo
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {apiBaseUrl && mode === "sender" && listWallet && (
                    <div className="mt-2">
                        <ShipmentTracker apiBaseUrl={apiBaseUrl} wallet={listWallet} />
                    </div>
                )}

                <p className="text-sm text-muted mt-3 mb-0 content-narrow">
                    Operación con wallet conectada:{" "}
                    <Link prefetch={false} href="/admin">
                        Panel Admin
                    </Link>
                    .
                </p>
            </div>
        </main>
    );
}
