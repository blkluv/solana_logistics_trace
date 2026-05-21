/** Presentación de wallets en UI (alineado con backend `mask_wallet`). */

export function maskWallet(wallet: string): string {
    const t = wallet.trim();
    if (t.length <= 10) {
        return t;
    }
    return `${t.slice(0, 4)}…${t.slice(-4)}`;
}

export type WalletParticipant = {
    wallet: string;
    walletMasked: string;
    displayName: string;
    role: string | null;
};

export function formatParticipantLine(p: WalletParticipant): string {
    if (p.displayName && p.displayName !== p.walletMasked) {
        return p.displayName;
    }
    return p.walletMasked;
}

export function formatParticipantSub(p: WalletParticipant): string {
    const role = p.role ? ` · ${p.role}` : "";
    return `${p.walletMasked}${role}`;
}
