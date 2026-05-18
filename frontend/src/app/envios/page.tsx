"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { getPublicConfig } from "@/lib/env";
import { isShipmentServiceUuid } from "@/lib/api/publicShipments";

export default function PublicEnviosPage() {
    const router = useRouter();
    const { apiBaseUrl } = getPublicConfig();
    const [shipmentIdInput, setShipmentIdInput] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    const onSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const id = shipmentIdInput.trim();
            if (!id) {
                setFormError("Indique el UUID del servicio.");
                return;
            }
            if (!isShipmentServiceUuid(id)) {
                setFormError("El UUID no es válido. Use el formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.");
                return;
            }
            setFormError(null);
            router.push(`/envios/${encodeURIComponent(id)}`);
        },
        [router, shipmentIdInput],
    );

    return (
        <main className="page-main">
            <div className="shell">
                <div className="content-narrow">
                    <h1 className="page-title">Consulta pública de envíos</h1>
                    <p className="page-sub">
                        Introduzca el UUID del servicio (identificador del envío en el sistema) para ver
                        el estado, la línea de tiempo y el mapa de eventos.
                    </p>

                    {!apiBaseUrl && (
                        <p className="text-muted text-sm" role="status">
                            Configure <code className="mono">NEXT_PUBLIC_API_BASE_URL</code>.
                        </p>
                    )}

                    <div className="card mt-2">
                        <div className="card__hd">Buscar envío</div>
                        <div className="card__bd">
                            <form onSubmit={onSearch}>
                                <div className="form-group">
                                    <label htmlFor="ship-service-uuid">UUID del servicio</label>
                                    <input
                                        id="ship-service-uuid"
                                        className="input mono"
                                        autoComplete="off"
                                        spellCheck={false}
                                        placeholder="c27c4b9e-f021-4254-b39f-559de2523639"
                                        value={shipmentIdInput}
                                        disabled={!apiBaseUrl}
                                        onChange={(e) => {
                                            setShipmentIdInput(e.target.value);
                                            setFormError(null);
                                        }}
                                    />
                                    <p className="text-xs text-muted mb-0 mt-1">
                                        Es el identificador que recibe al crear o sincronizar el envío (no
                                        confundir con el número on-chain).
                                    </p>
                                </div>
                                {formError ? (
                                    <p className="text-sm admin-form__err mb-2" role="alert">
                                        {formError}
                                    </p>
                                ) : null}
                                <button
                                    type="submit"
                                    className="btn btn--primary btn--sm"
                                    disabled={!apiBaseUrl}
                                >
                                    Consultar envío
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

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
