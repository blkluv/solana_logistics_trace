import { describe, expect, it } from "vitest";

import { formatGeoPoint, parseGeoPoint } from "./geoPoint";

describe("geoPoint", () => {
    it("formats and parses lat,lng", () => {
        const s = formatGeoPoint({ lat: 40.416775, lng: -3.70379 });
        expect(s).toBe("40.416775,-3.703790");
        expect(parseGeoPoint(s)).toEqual({ lat: 40.416775, lng: -3.70379 });
    });

    it("rejects invalid coords", () => {
        expect(parseGeoPoint("Madrid")).toBeNull();
        expect(parseGeoPoint("91,0")).toBeNull();
    });
});
