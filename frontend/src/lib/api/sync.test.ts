import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { postActorsSync, postCheckpointsSync, postShipmentsSync } from "./sync";

describe("Etapa 1 sync client", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("posts actors/sync with snake_case body and trims base URL slashes", async () => {
        const fetchSpy = fetch as unknown as ReturnType<typeof vi.fn>;
        fetchSpy.mockResolvedValue({
            ok: true,
            status: 201,
            text: async () => JSON.stringify({ wallet: "W" }),
        });

        const base = "http://localhost:8000/api/v1/";
        const r = await postActorsSync(base, { tx_hash: "abcd" });

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(fetchSpy.mock.calls[0][0]).toBe("http://localhost:8000/api/v1/actors/sync");

        expect(r.status).toBe(201);
        expect(r.ok).toBe(true);
        expect(r.json).toEqual({ wallet: "W" });
    });

    it("returns 200 for idempotent shipment sync responses", async () => {
        const fetchSpy = fetch as unknown as ReturnType<typeof vi.fn>;
        fetchSpy.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () =>
                JSON.stringify({
                    shipmentId: "uuid",
                    onChainShipmentId: "1",
                }),
        });

        const r = await postShipmentsSync("http://x/api/v1", { tx_hash: "sig111" });

        expect(r.status).toBe(200);
        expect(r.ok).toBe(true);
        expect(fetchSpy.mock.calls[0][0]).toBe("http://x/api/v1/shipments/sync");

        expect((fetchSpy.mock.calls[0][1] as RequestInit).method).toBe("POST");

        expect((fetchSpy.mock.calls[0][1] as RequestInit).body).toBe(
            JSON.stringify({ tx_hash: "sig111" }),
        );
    });

    it("parses checkpoints/sync errors as JSON bodies", async () => {
        const fetchSpy = fetch as unknown as ReturnType<typeof vi.fn>;
        fetchSpy.mockResolvedValue({
            ok: false,
            status: 400,
            text: async () =>
                JSON.stringify({
                    error: "bad discriminator",
                }),
        });

        const r = await postCheckpointsSync("http://x/api/v1", {
            tx_hash: "bad",
            commitment: "confirmed",
        });

        expect(r.ok).toBe(false);
        expect(r.status).toBe(400);
        expect(r.json).toEqual({ error: "bad discriminator" });

        expect((fetchSpy.mock.calls[0][1] as RequestInit).body).toBe(
            JSON.stringify({ tx_hash: "bad", commitment: "confirmed" }),
        );
    });

    it("handles empty response bodies gracefully", async () => {
        const fetchSpy = fetch as unknown as ReturnType<typeof vi.fn>;
        fetchSpy.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => "",
        });

        const r = await postActorsSync("http://x/api/v1", { tx_hash: "sig" });
        expect(r.json).toBeNull();
    });
});
