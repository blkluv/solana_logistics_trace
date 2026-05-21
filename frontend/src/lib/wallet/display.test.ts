import { describe, expect, it } from "vitest";

import { formatParticipantLine, maskTxSignature, maskWallet } from "./display";

describe("maskTxSignature", () => {
    it("truncates long signatures", () => {
        const tx = "5K7x8y9zAbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghij";
        expect(maskTxSignature(tx)).toMatch(/^5K7x8y9z…/);
    });

    it("keeps system prefix hashes", () => {
        expect(maskTxSignature("system:abc-123")).toBe("system:abc-123");
    });
});

describe("maskWallet", () => {
    it("truncates long base58 addresses", () => {
        expect(maskWallet("38UvLTagqQvnjHDYPeHt5x3hh1QMKQ3WcLMbqqa35VG9")).toBe("38Uv…5VG9");
    });
});

describe("formatParticipantLine", () => {
    it("prefers display name over masked wallet", () => {
        expect(
            formatParticipantLine({
                wallet: "full",
                walletMasked: "38Uv…5VG9",
                displayName: "Acme Logistics",
                role: "Sender",
            }),
        ).toBe("Acme Logistics");
    });
});
