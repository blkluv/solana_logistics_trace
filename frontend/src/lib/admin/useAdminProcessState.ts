"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

import { useShipmentsList } from "@/lib/api/useShipmentsList";
import type { AdminProcessContext } from "@/lib/admin/processCapabilities";
import { getPublicConfig } from "@/lib/env";
import { fetchProgramConfig } from "@/lib/solana/program_config";
import { actorPda, shipmentPda } from "@/lib/solana/pdas";
import { useWalletSession } from "@/lib/wallet/WalletSessionContext";

export function useAdminProcessState() {
    const cfg = useMemo(() => getPublicConfig(), []);
    const programId = cfg.programPublicKey;
    const apiBase = cfg.apiBaseUrl.trim() !== "" ? cfg.apiBaseUrl : undefined;

    const { wallet, role, actorLoading } = useWalletSession();
    const connection = useMemo(() => new Connection(cfg.rpcUrl, "confirmed"), [cfg.rpcUrl]);
    const payer = useMemo(() => (wallet ? new PublicKey(wallet) : null), [wallet]);

    const [prog, setProg] = useState<Awaited<ReturnType<typeof fetchProgramConfig>>>(null);
    const [actorOnChain, setActorOnChain] = useState<boolean | null>(null);
    const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

    const { rows, loading: shipmentsLoading, reload: reloadShipments } = useShipmentsList(
        apiBase,
        wallet,
    );

    const refreshProgram = useCallback(async () => {
        if (!programId) {
            setProg(null);
            return;
        }
        const res = await fetchProgramConfig(connection, programId);
        setProg(res);
    }, [connection, programId]);

    const refreshActorOnChain = useCallback(async () => {
        if (!programId || !payer) {
            setActorOnChain(null);
            return;
        }
        const [pda] = actorPda(programId, payer);
        try {
            const acc = await connection.getAccountInfo(pda, "confirmed");
            setActorOnChain(Boolean(acc?.data?.length));
        } catch {
            setActorOnChain(null);
        }
    }, [connection, programId, payer]);

    const refreshAll = useCallback(async () => {
        await Promise.all([refreshProgram(), refreshActorOnChain(), reloadShipments()]);
    }, [refreshProgram, refreshActorOnChain, reloadShipments]);

    useEffect(() => {
        let cancel = false;
        void (async () => {
            if (!programId) {
                if (!cancel) {
                    setProg(null);
                }
                return;
            }
            const res = await fetchProgramConfig(connection, programId);
            if (!cancel) {
                setProg(res);
            }
        })();
        return () => {
            cancel = true;
        };
    }, [connection, programId]);

    useEffect(() => {
        void Promise.resolve().then(() => void refreshActorOnChain());
    }, [refreshActorOnChain, prog]);

    useEffect(() => {
        if (!rows?.length) {
            queueMicrotask(() => setSelectedShipmentId(null));
            return;
        }
        queueMicrotask(() => {
            setSelectedShipmentId((prev) => {
                if (prev && rows.some((r) => r.shipmentId === prev)) {
                    return prev;
                }
                return rows[0]!.shipmentId;
            });
        });
    }, [rows]);

    const selectedShipment = useMemo(
        () => rows?.find((r) => r.shipmentId === selectedShipmentId) ?? null,
        [rows, selectedShipmentId],
    );

    const selectedShipmentPda = useMemo(() => {
        if (!programId || !selectedShipment) {
            return null;
        }
        try {
            const id = BigInt(selectedShipment.onChainShipmentId);
            const [pk] = shipmentPda(programId, id);
            return pk;
        } catch {
            return null;
        }
    }, [programId, selectedShipment]);

    const processContext: AdminProcessContext = useMemo(
        () => ({
            walletConnected: Boolean(wallet),
            programConfigured: Boolean(programId),
            programActive: Boolean(prog),
            actorOnChain: actorOnChain === true,
            actorInBackend: Boolean(role),
            selectedShipmentId,
            hasShipments: Boolean(rows && rows.length > 0),
            role,
        }),
        [wallet, programId, prog, actorOnChain, role, selectedShipmentId, rows],
    );

    return {
        cfg,
        programId,
        connection,
        payer,
        wallet,
        role,
        actorLoading,
        prog,
        processContext,
        actorOnChain,
        rows,
        shipmentsLoading,
        selectedShipmentId,
        setSelectedShipmentId,
        selectedShipment,
        selectedShipmentPda,
        refreshProgram,
        refreshActorOnChain,
        refreshAll,
    };
}
