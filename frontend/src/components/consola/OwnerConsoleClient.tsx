"use client";

import { Connection, PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ClusterPanel } from "@/components/ClusterPanel";
import {
    ConsolaStatusCard,
    healthToneFromText,
    rpcToneFromText,
    type ConsolaStatusTone,
} from "@/components/consola/ConsolaStatusCard";
import { InitializeProgramPanel } from "@/components/consola/InitializeProgramPanel";
import {
    IconBox,
    IconCheckCircle,
    IconHub,
    IconLink,
    IconRadio,
} from "@/components/ui/TraceIcons";
import { adminHints } from "@/lib/panel/etapa1UserMessages";
import { apiOriginFromApiBase, getPublicConfig } from "@/lib/env";
import { fetchProgramConfig } from "@/lib/solana/program_config";
import { useWalletSession } from "@/lib/wallet/WalletSessionContext";

type HealthJson = {
    status?: string;
    database?: string;
};

type SolanaHealthJson = {
    rpc_health?: string;
};

function joinApiPath(apiBaseUrl: string, segment: string): string {
    const base = apiBaseUrl.replace(/\/+$/, "");
    const path = segment.replace(/^\/+/, "");
    return `${base}/${path}`;
}

function programStatusLabel(active: boolean, loading: boolean, configured: boolean): string {
    if (!configured) {
        return "Sin configurar";
    }
    if (loading) {
        return "Comprobando";
    }
    return active ? "Activo" : "Pendiente";
}

function programTone(active: boolean, loading: boolean, configured: boolean): ConsolaStatusTone {
    if (!configured) {
        return "warn";
    }
    if (loading) {
        return "loading";
    }
    return active ? "ok" : "neutral";
}

/** Consola del dueño: salud HTTP, RPC, activación on-chain del programa y clúster. */
export function OwnerConsoleClient() {
    const cfg = getPublicConfig();
    const { apiBaseUrl, network, rpcUrl, programId, programPublicKey } = cfg;
    const origin = apiBaseUrl ? apiOriginFromApiBase(apiBaseUrl) : "";
    const { wallet } = useWalletSession();

    const connection = useMemo(() => new Connection(rpcUrl, "confirmed"), [rpcUrl]);
    const payer = useMemo(
        () => (wallet ? new PublicKey(wallet) : null),
        [wallet],
    );

    const [healthText, setHealthText] = useState("—");
    const [rpcApiText, setRpcApiText] = useState("—");
    const [healthLoading, setHealthLoading] = useState(true);
    const [programActive, setProgramActive] = useState(false);
    const [programLoading, setProgramLoading] = useState(false);

    const programConfigured = Boolean(programPublicKey);

    const refreshProgram = useCallback(async () => {
        if (!programPublicKey) {
            setProgramActive(false);
            return;
        }
        setProgramLoading(true);
        try {
            const res = await fetchProgramConfig(connection, programPublicKey);
            setProgramActive(Boolean(res));
        } catch {
            setProgramActive(false);
        } finally {
            setProgramLoading(false);
        }
    }, [connection, programPublicKey]);

    useEffect(() => {
        void Promise.resolve().then(() => void refreshProgram());
    }, [refreshProgram]);

    useEffect(() => {
        if (!apiBaseUrl || !origin) {
            void Promise.resolve().then(() => {
                setHealthText("Sin API base");
                setRpcApiText("—");
                setHealthLoading(false);
            });
            return;
        }
        let cancel = false;
        void Promise.resolve().then(async () => {
            setHealthLoading(true);
            try {
                const r = await fetch(`${origin}/health`, { headers: { Accept: "application/json" } });
                const j = (await r.json()) as HealthJson;
                if (!cancel) {
                    setHealthText(
                        r.ok
                            ? `${j.status ?? "ok"} · DB ${j.database ?? "?"}`
                            : `HTTP ${r.status}`,
                    );
                }
            } catch {
                if (!cancel) {
                    setHealthText("No responde");
                }
            }
            try {
                const r2 = await fetch(joinApiPath(apiBaseUrl, "solana/health"), {
                    headers: { Accept: "application/json" },
                });
                const j2 = (await r2.json()) as SolanaHealthJson;
                if (!cancel) {
                    setRpcApiText(
                        r2.ok ? (j2.rpc_health ?? "ok") : `HTTP ${r2.status}`,
                    );
                }
            } catch {
                if (!cancel) {
                    setRpcApiText("No responde");
                }
            }
            if (!cancel) {
                setHealthLoading(false);
            }
        });
        return () => {
            cancel = true;
        };
    }, [apiBaseUrl, origin]);

    const backendTone = healthLoading ? "loading" : healthToneFromText(healthText);
    const rpcTone = healthLoading ? "loading" : rpcToneFromText(rpcApiText);
    const progTone = programTone(programActive, programLoading, programConfigured);

    return (
        <div className="consola-dashboard" aria-label="Estado del sistema">
            <div className="consola-summary" role="list" aria-label="Resumen de servicios">
                <div className={`consola-summary__item consola-summary__item--${backendTone}`} role="listitem">
                    <IconHub className="trace-icon consola-summary__icon" />
                    <span className="consola-summary__label">Backend</span>
                    <span className="consola-summary__value">{healthLoading ? "…" : healthText}</span>
                </div>
                <div className={`consola-summary__item consola-summary__item--${rpcTone}`} role="listitem">
                    <IconLink className="trace-icon consola-summary__icon" />
                    <span className="consola-summary__label">RPC (API)</span>
                    <span className="consola-summary__value">{healthLoading ? "…" : rpcApiText}</span>
                </div>
                <div className={`consola-summary__item consola-summary__item--${progTone}`} role="listitem">
                    <IconBox className="trace-icon consola-summary__icon" />
                    <span className="consola-summary__label">Programa</span>
                    <span className="consola-summary__value">
                        {programStatusLabel(programActive, programLoading, programConfigured)}
                    </span>
                </div>
            </div>

            <div className="consola-grid">
                <ConsolaStatusCard
                    icon={<IconBox className="trace-icon" />}
                    title="Programa on-chain"
                    subtitle="Cuenta ProgramConfig tras anchor deploy"
                    tone={progTone}
                    statusLabel={programStatusLabel(programActive, programLoading, programConfigured)}
                    testId="consola-program-card"
                >
                    <p className="consola-card__text mb-0">
                        Operación de administración general. Inicialización única por red antes del
                        registro de actores y envíos.
                    </p>
                    {!programPublicKey ? (
                        <p className="consola-card__hint mb-0">{adminHints.programNotConfigured}</p>
                    ) : !wallet ? (
                        <p className="consola-card__hint mb-0">{adminHints.walletConnect}</p>
                    ) : programLoading ? (
                        <p className="consola-card__hint mb-0">Comprobando estado del programa…</p>
                    ) : programActive ? (
                        <p className="consola-card__ok mb-0" data-testid="initialize-program-active">
                            <IconCheckCircle className="trace-icon consola-card__ok-icon" />
                            Programa activo en <strong>{network}</strong>. Listo para operación.
                        </p>
                    ) : (
                        <InitializeProgramPanel
                            connection={connection}
                            programId={programPublicKey}
                            payer={payer!}
                            programActive={programActive}
                            onSuccess={() => void refreshProgram()}
                        />
                    )}
                </ConsolaStatusCard>

                <ConsolaStatusCard
                    icon={<IconHub className="trace-icon" />}
                    title="Backend"
                    subtitle="Servicio REST y base de datos"
                    tone={backendTone}
                    statusLabel={backendTone === "ok" ? "Operativo" : backendTone === "loading" ? "…" : "Revisar"}
                    testId="consola-backend-card"
                >
                    <dl className="consola-kv">
                        <div>
                            <dt>Endpoint</dt>
                            <dd className="mono text-xs break-all">{origin || "—"}</dd>
                        </div>
                        <div>
                            <dt>Ruta</dt>
                            <dd className="mono text-xs">GET /health</dd>
                        </div>
                        <div>
                            <dt>Respuesta</dt>
                            <dd className="mono text-sm" data-testid="owner-console-health">
                                {healthText}
                            </dd>
                        </div>
                    </dl>
                </ConsolaStatusCard>

                <ConsolaStatusCard
                    icon={<IconLink className="trace-icon" />}
                    title="Blockchain (API)"
                    subtitle="RPC usado por el backend para sync"
                    tone={rpcTone}
                    statusLabel={rpcTone === "ok" ? "Conectado" : rpcTone === "loading" ? "…" : "Revisar"}
                    testId="consola-rpc-card"
                >
                    <dl className="consola-kv">
                        <div>
                            <dt>Ruta</dt>
                            <dd className="mono text-xs">GET /api/v1/solana/health</dd>
                        </div>
                        <div>
                            <dt>Estado RPC</dt>
                            <dd className="mono text-sm" data-testid="owner-console-rpc-api">
                                {rpcApiText}
                            </dd>
                        </div>
                    </dl>
                </ConsolaStatusCard>

                <ClusterPanel
                    variant="console"
                    network={network}
                    rpcUrl={rpcUrl}
                    programId={programId}
                />
            </div>

            <p className="consola-footnote text-xs text-muted mb-0">
                Red pública: <span className="mono">{network}</span>
                {apiBaseUrl ? (
                    <>
                        {" "}
                        · API: <span className="mono break-all">{apiBaseUrl}</span>
                    </>
                ) : null}
            </p>
        </div>
    );
}
