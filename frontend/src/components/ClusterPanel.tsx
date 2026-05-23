"use client";

import { useEffect, useState } from "react";

import { ConsolaStatusCard } from "@/components/consola/ConsolaStatusCard";
import { IconRadio } from "@/components/ui/TraceIcons";

export type ClusterPanelProps = {
    network: string;
    rpcUrl: string;
    programId: string;
    /** `console` = tarjeta alineada con la consola del sistema. */
    variant?: "default" | "console";
};

type VersionPayload = {
    ok?: boolean;
    solanaCore?: string;
    hint?: string;
};

/** Clúster configurado (+ `getVersion` vía proxy same-origin por CORS). */
export function ClusterPanel({ network, rpcUrl, programId, variant = "default" }: ClusterPanelProps) {
    const [rpcHint, setRpcHint] = useState<string>("…");

    useEffect(() => {
        let cancel = false;

        fetch("/api/solana/version")
            .then((r) => r.json() as Promise<VersionPayload>)
            .then((data) => {
                if (cancel) {
                    return;
                }
                if (data.ok && data.solanaCore) {
                    setRpcHint(data.solanaCore);
                } else {
                    setRpcHint(data.hint ?? "sin respuesta");
                }
            })
            .catch(() => {
                if (!cancel) {
                    setRpcHint("sin respuesta");
                }
            });

        return () => {
            cancel = true;
        };
    }, []);

    const versionTone =
        rpcHint === "…" ? "loading" : rpcHint === "sin respuesta" ? "err" : "ok";
    const statusLabel =
        versionTone === "ok" ? "RPC accesible" : versionTone === "loading" ? "…" : "Revisar proxy";

    const body = (
        <>
            <p className="consola-card__text mb-0">
                Parámetros públicos desde <code className="mono">NEXT_PUBLIC_*</code>. La versión del
                nodo se consulta vía proxy de Next para evitar CORS en el navegador.
            </p>
            <dl className="consola-kv consola-kv--cluster">
                <div>
                    <dt>Red</dt>
                    <dd data-testid="cluster-network">{network}</dd>
                </div>
                <div>
                    <dt>RPC</dt>
                    <dd className="mono text-xs break-all" data-testid="cluster-rpc">
                        {rpcUrl}
                    </dd>
                </div>
                <div>
                    <dt>Program ID</dt>
                    <dd className="mono text-xs break-all" data-testid="cluster-program-id">
                        {programId.trim() !== "" ? programId : "—"}
                    </dd>
                </div>
                <div>
                    <dt>solana-core</dt>
                    <dd data-testid="cluster-version-hint">{rpcHint}</dd>
                </div>
            </dl>
        </>
    );

    if (variant === "console") {
        return (
            <ConsolaStatusCard
                icon={<IconRadio className="trace-icon" />}
                title="Clúster Solana"
                subtitle="Configuración pública del frontend"
                tone={versionTone}
                statusLabel={statusLabel}
                testId="cluster-panel"
            >
                {body}
            </ConsolaStatusCard>
        );
    }

    return (
        <section
            className="card"
            aria-label="Solana configurada"
            data-testid="cluster-panel"
            suppressHydrationWarning
        >
            <div className="card__hd">
                <span>Clúster (.env público)</span>
            </div>
            <div className="card__bd">{body}</div>
        </section>
    );
}
