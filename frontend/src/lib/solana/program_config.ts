import { Buffer } from "buffer";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

import { ACCOUNT_PROGRAM_CONFIG } from "./ix";
import { configPda } from "./pdas";

export type ProgramConfigView = {
    authority: PublicKey;
    actorsRegistered: bigint;
    shipmentsCreated: bigint;
    checkpointsRecorded: bigint;
    incidentsReported: bigint;
};

/** Lee y decodifica `ProgramConfig` on-chain (Borsh, sin discriminator de Anchor en cuenta). */
export async function fetchProgramConfig(
    connection: Connection,
    programId: PublicKey,
): Promise<{ pda: PublicKey; decoded: ProgramConfigView } | null> {
    const [pda] = configPda(programId);
    const acc = await connection.getAccountInfo(pda, "confirmed");
    const data = acc?.data ? Buffer.from(acc.data) : null;
    if (!data || data.length < 8 + 32 + 8 + 8 + 8 + 8) {
        return null;
    }

    const disc = data.subarray(0, 8);
    if (!disc.equals(ACCOUNT_PROGRAM_CONFIG)) {
        return null;
    }

    let offset = 8;
    const authority = new PublicKey(data.subarray(offset, offset + 32));
    offset += 32;
    const actorsRegistered = data.readBigUInt64LE(offset);
    offset += 8;
    const shipmentsCreated = data.readBigUInt64LE(offset);
    offset += 8;
    const checkpointsRecorded = data.readBigUInt64LE(offset);
    offset += 8;
    const incidentsReported = data.readBigUInt64LE(offset);

    return {
        pda,
        decoded: {
            authority,
            actorsRegistered,
            shipmentsCreated,
            checkpointsRecorded,
            incidentsReported,
        },
    };
}
