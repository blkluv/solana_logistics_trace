"use client";

import { useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";

export type ClusterPanelProps = {
    network: string;
    rpcUrl: string;
    programId: string;
};

/** Shows configured cluster (env) plus a best-effort `getVersion` against the RPC URL. */
export function ClusterPanel({ network, rpcUrl, programId }: ClusterPanelProps) {
    const [rpcHint, setRpcHint] = useState<string>("…");

    useEffect(() => {
        let cancel = false;
        const conn = new Connection(rpcUrl, "confirmed");
        conn
            .getVersion()
            .then((v) => {
                const core =
                    typeof v === "object" && v !== null && "solana-core" in v
                        ? String((v as { "solana-core": string })["solana-core"])
                        : JSON.stringify(v);
                if (!cancel) {
                    setRpcHint(core);
                }
            })
            .catch(() => {
                if (!cancel) {
                    setRpcHint("unreachable");
                }
            });
        return () => {
            cancel = true;
        };
    }, [rpcUrl]);

    return (
        <section
            className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
            aria-label="configured Solana network"
            data-testid="cluster-panel"
        >
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Cluster (from env)
            </h2>
            <dl className="grid grid-cols-[min-content_1fr] gap-x-6 gap-y-2 text-sm">
                <dt className="text-zinc-500 dark:text-zinc-400">Network</dt>
                <dd data-testid="cluster-network">{network}</dd>

                <dt className="text-zinc-500 dark:text-zinc-400">RPC URL</dt>
                <dd className="break-all font-mono text-xs" data-testid="cluster-rpc">
                    {rpcUrl}
                </dd>

                <dt className="text-zinc-500 dark:text-zinc-400">Program ID</dt>
                <dd className="break-all font-mono text-xs" data-testid="cluster-program-id">
                    {programId.trim() !== "" ? programId : "—"}
                </dd>

                <dt className="text-zinc-500 dark:text-zinc-400">solana-core</dt>
                <dd data-testid="cluster-version-hint">{rpcHint}</dd>
            </dl>
        </section>
    );
}
