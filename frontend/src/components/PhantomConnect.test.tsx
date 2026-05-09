import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PhantomConnect } from "./PhantomConnect";

describe("PhantomConnect", () => {
    type PhantomLikeWallet = NonNullable<(typeof window)["solana"]>;

    const snapshot = (): PhantomLikeWallet | undefined => {
        if (typeof window === "undefined") {
            return undefined;
        }
        return window.solana;
    };

    let previous: PhantomLikeWallet | undefined;

    beforeEach(() => {
        previous = snapshot();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        if (typeof window === "undefined") {
            return;
        }
        Object.defineProperty(window, "solana", {
            configurable: true,
            writable: true,
            value: previous,
        });
    });

    it("renders Phantom connect trigger", () => {
        Object.defineProperty(window, "solana", {
            configurable: true,
            writable: true,
            value: undefined,
        });
        render(<PhantomConnect />);
        expect(screen.getByTestId("phantom-connect-button")).toBeInTheDocument();
    });

    it("connects via mocked window.solana", async () => {
        const pk = "DemoPubKey11111111111111111111111111111111";
        const connect = vi.fn().mockResolvedValue({
            publicKey: { toBase58: () => pk },
        });
        const disconnect = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(window, "solana", {
            configurable: true,
            writable: true,
            value: { isPhantom: true, connect, disconnect },
        });
        render(<PhantomConnect />);
        fireEvent.click(screen.getByTestId("phantom-connect-button"));
        await waitFor(() =>
            expect(screen.getByTestId("wallet-pubkey")).toHaveTextContent(pk),
        );
        expect(connect).toHaveBeenCalledTimes(1);
        expect(connect).toHaveBeenCalledWith({ onlyIfTrusted: false });
    });

    it("surfaces guidance when Phantom is missing", async () => {
        Object.defineProperty(window, "solana", {
            configurable: true,
            writable: true,
            value: {},
        });
        render(<PhantomConnect />);
        fireEvent.click(screen.getByTestId("phantom-connect-button"));
        await waitFor(() =>
            expect(screen.getByTestId("phantom-error")).toHaveTextContent(
                /Phantom no encontrado/i,
            ),
        );
    });
});
