/**
 * Mapea códigos de filas `cat_*` (PostgreSQL) a índices Borsh del programa (`ix.ts`).
 */
import type { ActorRoleCode, CheckpointTypeCode } from "@/lib/solana/ix";
import { ActorRoleCode as Role, CheckpointTypeCode as Cp } from "@/lib/solana/ix";

export type CatalogOptionRow<T extends number> = {
    code: string;
    label: string;
    value: T;
};

const ACTOR_BY_CODE: Record<string, ActorRoleCode> = {
    Sender: Role.Sender,
    Carrier: Role.Carrier,
    Hub: Role.Hub,
    Recipient: Role.Recipient,
    Inspector: Role.Inspector,
};

const CHECKPOINT_BY_CODE: Record<string, CheckpointTypeCode> = {
    Pickup: Cp.Pickup,
    HubIn: Cp.HubIn,
    HubOut: Cp.HubOut,
    Transit: Cp.Transit,
    DeliveryAttempt: Cp.DeliveryAttempt,
    Delivered: Cp.Delivered,
    SensorData: Cp.SensorData,
};

export function mapActorCatalogToOptions(
    items: readonly { code: string; label: string }[],
    onUnknownCode?: (code: string) => void,
): CatalogOptionRow<ActorRoleCode>[] {
    const out: CatalogOptionRow<ActorRoleCode>[] = [];
    for (const it of items) {
        const value = ACTOR_BY_CODE[it.code];
        if (value === undefined) {
            onUnknownCode?.(it.code);
            continue;
        }
        out.push({ code: it.code, label: it.label || it.code, value });
    }
    return out;
}

export function mapCheckpointCatalogToOptions(
    items: readonly { code: string; label: string }[],
    onUnknownCode?: (code: string) => void,
): CatalogOptionRow<CheckpointTypeCode>[] {
    const out: CatalogOptionRow<CheckpointTypeCode>[] = [];
    for (const it of items) {
        const value = CHECKPOINT_BY_CODE[it.code];
        if (value === undefined) {
            onUnknownCode?.(it.code);
            continue;
        }
        out.push({ code: it.code, label: it.label || it.code, value });
    }
    return out;
}
