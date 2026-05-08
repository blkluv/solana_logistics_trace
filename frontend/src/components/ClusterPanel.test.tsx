import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ClusterPanel } from "./ClusterPanel";

describe("ClusterPanel", () => {
    beforeEach(() => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    ok: true,
                    solanaCore: "stub-9.9.9",
                }),
            }),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("shows network and RPC metadata from props", async () => {
        const { container } = render(
            <ClusterPanel
                network="devnet"
                rpcUrl="https://rpc.test.example"
                programId="ProgId1111111111111111111111111111111"
            />,
        );
        const panel = screen.getByTestId("cluster-panel");
        expect(within(panel).getByTestId("cluster-network")).toHaveTextContent(
            "devnet",
        );
        expect(within(panel).getByTestId("cluster-rpc")).toHaveTextContent(
            "https://rpc.test.example",
        );
        expect(within(panel).getByTestId("cluster-program-id")).toHaveTextContent(
            "ProgId1111111111111111111111111111111",
        );
        await waitFor(() =>
            expect(
                within(panel).getByTestId("cluster-version-hint"),
            ).toHaveTextContent("stub-9.9.9"),
        );
        expect(container).toBeTruthy();
        expect(fetch).toHaveBeenCalledWith("/api/solana/version");
    });

    it("renders an em-dash when PROGRAM_ID unset for display", () => {
        render(<ClusterPanel network="localnet" rpcUrl="http://x" programId="" />);
        const panel = screen.getByTestId("cluster-panel");
        expect(within(panel).getByTestId("cluster-program-id")).toHaveTextContent(
            "—",
        );
    });
});
