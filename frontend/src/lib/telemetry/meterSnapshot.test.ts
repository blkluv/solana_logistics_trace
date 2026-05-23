import { describe, expect, it } from "vitest";

import type { TelemetryEventItem } from "@/lib/api/telemetry";

import {
    buildMeterSnapshot,
    meterSnapshotToFormFields,
    parseCheckpointHumidityForChain,
    parseCheckpointTemperatureForChain,
    temperatureCelsiusToChain,
} from "./meterSnapshot";

const base: TelemetryEventItem = {
    id: "1",
    shipmentId: "s",
    telemetryType: "temperature",
    valueNumeric: 5.2,
    latitude: null,
    longitude: null,
    recordedAt: "2026-05-18T10:00:00Z",
};

describe("buildMeterSnapshot", () => {
    it("picks latest reading per sensor type", () => {
        const snap = buildMeterSnapshot([
            { ...base, id: "t1", valueNumeric: 4.0, recordedAt: "2026-05-18T09:00:00Z" },
            { ...base, id: "t2", valueNumeric: 6.5, recordedAt: "2026-05-18T11:00:00Z" },
            {
                ...base,
                id: "g1",
                telemetryType: "gps",
                valueNumeric: null,
                latitude: 13.7,
                longitude: -89.2,
                recordedAt: "2026-05-18T11:30:00Z",
            },
            {
                ...base,
                id: "h1",
                telemetryType: "humidity",
                valueNumeric: 62.4,
                recordedAt: "2026-05-18T11:00:00Z",
            },
        ]);
        expect(snap.temperatureCelsius).toBe(6.5);
        expect(snap.coordinates).toEqual({ lat: 13.7, lng: -89.2 });
        expect(snap.humidityPct).toBe(62.4);
        expect(snap.capturedAt).toBe("2026-05-18T11:30:00Z");
    });
});

describe("meterSnapshotToFormFields", () => {
    it("formats values for the checkpoint form", () => {
        const fields = meterSnapshotToFormFields({
            coordinates: { lat: 13.7, lng: -89.2 },
            temperatureCelsius: 6.5,
            humidityPct: 62.4,
            capturedAt: null,
        });
        expect(fields.coordValue).toContain("13.7");
        expect(fields.temp).toBe("6.5");
        expect(fields.humidity).toBe("62");
    });
});

describe("chain parsers", () => {
    it("converts celsius input to centidegrees", () => {
        expect(parseCheckpointTemperatureForChain("6.5")).toBe(650);
        expect(temperatureCelsiusToChain(6.5)).toBe(650);
    });

    it("clamps humidity to u8 range", () => {
        expect(parseCheckpointHumidityForChain("62.4")).toBe(62);
        expect(parseCheckpointHumidityForChain("300")).toBe(255);
    });
});
