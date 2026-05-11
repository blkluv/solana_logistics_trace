import { describe, expect, it, vi } from "vitest";

import { mapActorCatalogToOptions, mapCheckpointCatalogToOptions } from "./catalogCodeMap";
import { ActorRoleCode, CheckpointTypeCode } from "./ix";

describe("catalogCodeMap", () => {
    it("maps known actor codes to enum values", () => {
        const rows = mapActorCatalogToOptions([{ code: "Inspector", label: "Inspector" }]);
        expect(rows).toEqual([
            { code: "Inspector", label: "Inspector", value: ActorRoleCode.Inspector },
        ]);
    });

    it("invokes callback and skips unknown actor codes", () => {
        const spy = vi.fn();
        const rows = mapActorCatalogToOptions(
            [
                { code: "Sender", label: "S" },
                { code: "NotARealRole", label: "X" },
            ],
            spy,
        );
        expect(spy).toHaveBeenCalledWith("NotARealRole");
        expect(rows).toHaveLength(1);
        expect(rows[0]?.value).toBe(ActorRoleCode.Sender);
    });

    it("maps checkpoint codes including HubIn", () => {
        const rows = mapCheckpointCatalogToOptions([{ code: "HubIn", label: "Hub inbound" }]);
        expect(rows[0]?.value).toBe(CheckpointTypeCode.HubIn);
        expect(rows[0]?.label).toBe("Hub inbound");
    });
});
