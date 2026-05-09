"use client";

import type { Transaction } from "@solana/web3.js";

import type { PhantomLikeProvider } from "@/types/solana-window";

export function formatPhantomConnectError(err: unknown): string {
    if (!(err instanceof Error)) {
        return "Conexión rechazada.";
    }
    const m = err.message;
    if (/Receiving end does not exist/i.test(m)) {
        return (
            "Phantom no completó la petición (mensajería de la extensión). " +
            "Recarga la pestaña o el navegador; actualiza Phantom si persiste."
        );
    }
    if (/could not establish connection/i.test(m)) {
        return (
            "No hay conexión con la extensión Phantom. Recarga la página o revisa conflicto con otras wallets."
        );
    }
    return m;
}

/** Devuelve el proveedor Phantom (`window.solana` o `window.phantom.solana`). */
export function getPhantom(): PhantomLikeProvider | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }

    const standard = window.solana;
    const nested = window.phantom?.solana;

    if (standard?.isPhantom) {
        return standard;
    }
    if (nested?.isPhantom) {
        return nested;
    }

    return standard ?? nested;
}

export async function signTransactionWithPhantom(tx: Transaction): Promise<Transaction> {
    const p = getPhantom();
    if (!p?.isPhantom || !p.signTransaction) {
        throw new Error(
            "Phantom no encontrada o no permite firmar. Conéctate e inténtalo de nuevo.",
        );
    }
    return p.signTransaction(tx);
}
