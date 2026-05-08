export type PhantomLikeProvider = {
    isPhantom?: boolean;
    connect(opts?: {
        onlyIfTrusted?: boolean;
    }): Promise<{ publicKey: { toBase58(): string } }>;
    disconnect?: () => Promise<void>;
};

declare global {
    interface Window {
        /** Injected browserside by Phantom (`window.solana`). */
        solana?: PhantomLikeProvider;
    }
}

export {};
