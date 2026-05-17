import { describe, expect, it } from "vitest";

import { userMessageFromTransactionError } from "./parseTransactionError";

describe("userMessageFromTransactionError", () => {
    it("detects already in use", () => {
        expect(
            userMessageFromTransactionError("Allocate: account Address { ... } already in use"),
        ).toMatch(/ya tiene un actor/);
    });

    it("detects insufficient lamports", () => {
        expect(userMessageFromTransactionError("Transaction results in an account with insufficient lamports")).toMatch(
            /SOL suficiente/,
        );
    });
});
