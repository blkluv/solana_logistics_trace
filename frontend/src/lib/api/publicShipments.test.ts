import { describe, expect, it } from "vitest";

import { isShipmentServiceUuid, publicShipmentLookupError } from "./publicShipments";

describe("publicShipments", () => {
    it("accepts valid UUID v4", () => {
        expect(isShipmentServiceUuid("c27c4b9e-f021-4254-b39f-559de2523639")).toBe(true);
    });

    it("rejects invalid ids", () => {
        expect(isShipmentServiceUuid("not-uuid")).toBe(false);
        expect(isShipmentServiceUuid("")).toBe(false);
    });

    it("maps 404 to friendly message", () => {
        expect(publicShipmentLookupError(404, null)).toMatch(/No existe/);
    });
});
