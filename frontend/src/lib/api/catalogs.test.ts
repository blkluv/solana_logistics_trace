import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    fetchActorRolesCatalog,
    fetchCheckpointTypesCatalog,
    parseCatalogApiResponse,
} from "./catalogs";

describe("catalogs API client", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("parseCatalogApiResponse accepts backend-shaped rows", () => {
        const rows = parseCatalogApiResponse([
            { code: "Sender", label: "Sender", description: null, sort_order: 10 },
            { code: "Carrier", label: "Carrier", description: null, sort_order: 20 },
        ]);
        expect(rows).toHaveLength(2);
        expect(rows[0]?.code).toBe("Sender");
        expect(rows[1]?.sort_order).toBe(20);
    });

    it("fetchActorRolesCatalog trims base URL and calls catalogs/actor-roles", async () => {
        const fetchSpy = fetch as unknown as ReturnType<typeof vi.fn>;
        fetchSpy.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [{ code: "Hub", label: "Hub", description: null, sort_order: 30 }],
        });

        const rows = await fetchActorRolesCatalog("http://localhost:8000/api/v1/");
        expect(fetchSpy.mock.calls[0][0]).toBe(
            "http://localhost:8000/api/v1/catalogs/actor-roles",
        );
        expect(rows[0]?.code).toBe("Hub");
    });

    it("fetchCheckpointTypesCatalog hits checkpoint-types path", async () => {
        const fetchSpy = fetch as unknown as ReturnType<typeof vi.fn>;
        fetchSpy.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [{ code: "Pickup", label: "Pickup", description: null, sort_order: 10 }],
        });

        await fetchCheckpointTypesCatalog("http://x/api/v1");
        expect(fetchSpy.mock.calls[0][0]).toBe("http://x/api/v1/catalogs/checkpoint-types");
    });

    it("throws when HTTP status is not ok", async () => {
        const fetchSpy = fetch as unknown as ReturnType<typeof vi.fn>;
        fetchSpy.mockResolvedValue({
            ok: false,
            status: 503,
            json: async () => ({}),
        });

        await expect(fetchActorRolesCatalog("http://x/api/v1")).rejects.toThrow(/HTTP 503/);
    });
});
