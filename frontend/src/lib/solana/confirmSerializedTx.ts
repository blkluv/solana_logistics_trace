import {
    Connection,
    PublicKey,
    Transaction,
    type TransactionInstruction,
} from "@solana/web3.js";

import { signTransactionWithPhantom } from "@/lib/wallet/phantom";

/** Firma con Phantom, envía y confirma una transacción de una sola instrucción. */
export async function confirmSerializedTx(
    connection: Connection,
    payer: PublicKey,
    ix: TransactionInstruction,
): Promise<string> {
    const latest = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({
        feePayer: payer,
        recentBlockhash: latest.blockhash,
    });
    tx.add(ix);
    tx.lastValidBlockHeight = latest.lastValidBlockHeight;

    const signed = await signTransactionWithPhantom(tx);
    const serialized = signed.serialize();

    const signature = await connection.sendRawTransaction(serialized, {
        skipPreflight: false,
    });

    await connection.confirmTransaction(
        {
            signature,
            blockhash: latest.blockhash,
            lastValidBlockHeight: latest.lastValidBlockHeight,
        },
        "confirmed",
    );

    return signature;
}
