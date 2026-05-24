import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { postSyncWithRetry } from "./syncWithRetry";

describe("postSyncWithRetry", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("retries on 404 until success", async () => {
        const fn = vi
            .fn()
            .mockResolvedValueOnce({ ok: false, status: 404, json: { error: "tx not found" } })
            .mockResolvedValueOnce({ ok: true, status: 201, json: { incidentId: "x" } });

        const promise = postSyncWithRetry(fn, { initialDelayMs: 100, maxAttempts: 3 });
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result.ok).toBe(true);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it("stops retrying on non-404 errors", async () => {
        const fn = vi.fn().mockResolvedValue({ ok: false, status: 422, json: { error: "bad" } });
        const result = await postSyncWithRetry(fn);
        expect(result.status).toBe(422);
        expect(fn).toHaveBeenCalledTimes(1);
    });
});
