import type { Transaction } from "@solana/web3.js";

export type PhantomLikeProvider = {
    isPhantom?: boolean;
    connect(opts?: {
        onlyIfTrusted?: boolean;
    }): Promise<{ publicKey: { toBase58(): string } }>;
    disconnect?: () => Promise<void>;
    signTransaction?: (tx: Transaction) => Promise<Transaction>;
};

declare global {
    interface Window {
        /** Standard injection (`window.solana`). */
        solana?: PhantomLikeProvider;
        /** Phantom on some browsers (e.g. Firefox) nests under `phantom.solana`. */
        phantom?: { solana?: PhantomLikeProvider };
    }
}

export {};
