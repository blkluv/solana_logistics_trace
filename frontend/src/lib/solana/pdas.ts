import { Buffer } from "buffer";
import type { PublicKey } from "@solana/web3.js";
import { PublicKey as Pub } from "@solana/web3.js";

export function configPda(programId: PublicKey): [PublicKey, number] {
    return Pub.findProgramAddressSync([Buffer.from("config", "utf8")], programId);
}

export function actorPda(programId: PublicKey, authority: PublicKey): [PublicKey, number] {
    return Pub.findProgramAddressSync([Buffer.from("actor", "utf8"), authority.toBuffer()], programId);
}

export function shipmentPda(programId: PublicKey, shipmentsCreatedPlusOne: bigint): [PublicKey, number] {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(shipmentsCreatedPlusOne, 0);
    return Pub.findProgramAddressSync([Buffer.from("shipment", "utf8"), buf], programId);
}

export function checkpointPda(
    programId: PublicKey,
    shipment: PublicKey,
    checkpointsRecordedPlusOne: bigint,
): [PublicKey, number] {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(checkpointsRecordedPlusOne, 0);
    return Pub.findProgramAddressSync(
        [Buffer.from("checkpoint", "utf8"), shipment.toBuffer(), buf],
        programId,
    );
}
