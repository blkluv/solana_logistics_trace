import { describe, expect, it } from "vitest";

import { parseCoordEndpoint, resolveJourneyStepStates } from "./journeyTimeline";
describe("parseCoordEndpoint", () => {
    it("formats lat,lng pairs", () => {
        const c = parseCoordEndpoint("13.70, -89.20");
        expect(c.label).toBe("13.70°, -89.20°");
        expect(c.lat).toBe(13.7);
    });
});

describe("resolveJourneyStepStates", () => {
    it("highlights InTransit as current", () => {
        const steps = resolveJourneyStepStates("InTransit", ["Pickup"]);
        const current = steps.find((s) => s.state === "current");
        expect(current?.step.id).toBe("transit");
    });

    it("marks pickup past when checkpoint exists", () => {
        const steps = resolveJourneyStepStates("InTransit", ["Pickup"]);
        const pickup = steps.find((s) => s.step.id === "pickup");
        expect(pickup?.state).toBe("past");
        expect(pickup?.eventRecorded).toBe(true);
    });

    it("created is current for new shipments", () => {
        const steps = resolveJourneyStepStates("Created", []);
        expect(steps[0]?.state).toBe("current");
    });
});
