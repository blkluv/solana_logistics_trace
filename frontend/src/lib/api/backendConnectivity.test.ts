import { describe, expect, it } from "vitest";

import {
    apiBaseHasV1Prefix,
    healthCheckUrlFromApiBase,
    normalizeApiBaseUrl,
} from "./backendConnectivity";

describe("backendConnectivity", () => {
    it("normalizes trailing slashes", () => {
        expect(normalizeApiBaseUrl("http://x/api/v1/")).toBe("http://x/api/v1");
    });

    it("detects /api/v1 suffix", () => {
        expect(apiBaseHasV1Prefix("http://localhost:8000/api/v1")).toBe(true);
        expect(apiBaseHasV1Prefix("http://localhost:8000/api/v1/")).toBe(true);
        expect(apiBaseHasV1Prefix("http://localhost:8000")).toBe(false);
    });

    it("maps API base to health URL", () => {
        expect(healthCheckUrlFromApiBase("http://localhost:8000/api/v1")).toBe(
            "http://localhost:8000/health",
        );
        expect(healthCheckUrlFromApiBase("")).toBeNull();
        expect(healthCheckUrlFromApiBase("   ")).toBeNull();
    });
});
