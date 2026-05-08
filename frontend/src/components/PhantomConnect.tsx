"use client";

import { useCallback, useState } from "react";

import type { PhantomLikeProvider } from "@/types/solana-window";

/** Returns the Phantom-compatible provider exposed on `window.solana`. */
export function getPhantom(): PhantomLikeProvider | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }
    return window.solana;
}

/** Minimal Phantom connector (Etapa 0 — backend never signs). */
export function PhantomConnect() {
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onConnect = useCallback(async () => {
        setError(null);
        const p = getPhantom();
        if (!p?.isPhantom) {
            setError("Phantom extension not found.");
            return;
        }
        try {
            const out = await p.connect();
            setPublicKey(out.publicKey.toBase58());
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Connection rejected.";
            setError(msg);
        }
    }, []);

    const onDisconnect = useCallback(async () => {
        setError(null);
        const p = getPhantom();
        if (p?.disconnect) {
            await p.disconnect().catch(() => undefined);
        }
        setPublicKey(null);
    }, []);

    return (
        <div className="space-y-3" data-testid="phantom-connect">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Phantom wallet
            </h2>
            {publicKey ? (
                <>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Connected public key:
                    </p>
                    <p
                        className="break-all font-mono text-sm text-zinc-900 dark:text-zinc-100"
                        data-testid="wallet-pubkey"
                    >
                        {publicKey}
                    </p>
                    <button
                        type="button"
                        onClick={onDisconnect}
                        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                        Disconnect
                    </button>
                </>
            ) : (
                <button
                    type="button"
                    onClick={onConnect}
                    className="rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-purple-700"
                    data-testid="phantom-connect-button"
                >
                    Connect Phantom
                </button>
            )}
            {error ? (
                <p role="alert" className="text-sm text-red-600" data-testid="phantom-error">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
