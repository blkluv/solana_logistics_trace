import { describe, expect, it } from "vitest";

import { formatParticipantLine, maskWallet } from "./display";

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
