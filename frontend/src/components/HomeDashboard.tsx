"use client";

import { ClusterPanel } from "@/components/ClusterPanel";
import { PhantomConnect } from "@/components/PhantomConnect";
import { getPublicConfig } from "@/lib/env";

export function HomeDashboard() {
    const cfg = getPublicConfig();

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-12">
            <header className="space-y-2">
                <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    TMF · Logistics traceability
                </p>
                <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                    Wallet and Solana cluster
                </h1>
                <p className="text-base text-zinc-600 dark:text-zinc-300">
                    Network and program identifiers come exclusively from{' '}
                    <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm dark:bg-zinc-900">
                        .env.local
                    </code>
                    . Phantom stays in the browser; the backend never receives your keys.
                </p>
                {cfg.apiBaseUrl ? (
                    <p className="text-sm text-zinc-500">
                        API base:{" "}
                        <code className="break-all text-xs">{cfg.apiBaseUrl}</code>
                    </p>
                ) : null}
            </header>

            <ClusterPanel
                network={cfg.network}
                rpcUrl={cfg.rpcUrl}
                programId={cfg.programId}
            />

            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
                <PhantomConnect />
            </div>
        </div>
    );
}
