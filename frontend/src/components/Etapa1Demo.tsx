"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Connection,
    PublicKey,
    Transaction,
    type TransactionInstruction,
} from "@solana/web3.js";

import {
    postActorsSync,
    postCheckpointsSync,
    postShipmentsSync,
} from "@/lib/api/sync";
import { getPublicConfig } from "@/lib/env";
import type { ActorRoleCode, CheckpointTypeCode } from "@/lib/solana/ix";
import { ActorRoleCode as Role } from "@/lib/solana/ix";
import {
    createCreateShipmentIx,
    createInitializeIx,
    createRecordCheckpointIx,
    createRegisterActorIx,
} from "@/lib/solana/instructions";
import { fetchProgramConfig } from "@/lib/solana/program_config";
import { shipmentPda } from "@/lib/solana/pdas";
import { signTransactionWithPhantom } from "@/lib/wallet/phantom";

import { PhantomConnect } from "./PhantomConnect";

async function confirmSerializedTx(
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

const ROLE_OPTIONS: { value: ActorRoleCode; label: string }[] = [
    { value: Role.Sender, label: "Sender" },
    { value: Role.Carrier, label: "Carrier" },
    { value: Role.Hub, label: "Hub" },
    { value: Role.Recipient, label: "Recipient" },
    { value: Role.Inspector, label: "Inspector" },
];

const CP_OPTIONS: { value: CheckpointTypeCode; label: string }[] = [
    { value: 0, label: "Pickup" },
    { value: 1, label: "HubIn" },
    { value: 2, label: "HubOut" },
    { value: 3, label: "Transit" },
    { value: 4, label: "DeliveryAttempt" },
    { value: 5, label: "Delivered" },
    { value: 6, label: "SensorData" },
];

export function Etapa1Demo() {
    const cfg = useMemo(() => getPublicConfig(), []);
    const programId = cfg.programPublicKey;

    const connection = useMemo(
        () => new Connection(cfg.rpcUrl, "confirmed"),
        [cfg.rpcUrl],
    );

    const [wallet, setWallet] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [busyKey, setBusyKey] = useState<string | null>(null);

    const [prog, setProg] =
        useState<Awaited<ReturnType<typeof fetchProgramConfig>>>(null);

    const [role, setRole] = useState<ActorRoleCode>(Role.Sender);
    const [actorName, setActorName] = useState("Operador Demo");
    const [actorLocation, setActorLocation] = useState("Madrid, ES");

    const [recipient, setRecipient] = useState("");
    const [product, setProduct] = useState("Vino Tinto");
    const [origin, setOrigin] = useState("Lisboa · Almacén A");
    const [destination, setDestination] = useState("Sevilla · Hub Sur");
    const [coldChain, setColdChain] = useState(false);

    const [cpType, setCpType] = useState<CheckpointTypeCode>(0 as CheckpointTypeCode);
    const [cpLocation, setCpLocation] = useState("Origen confirmado");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [temp, setTemp] = useState("");
    const [humidity, setHumidity] = useState("");
    const [metadata, setMetadata] = useState("{}");

    const [shipmentAccount, setShipmentAccount] = useState<PublicKey | null>(
        null,
    );

    const append = useCallback((msg: string) => {
        setLogs((prev) => [
            ...prev.slice(-160),
            `[${new Date().toISOString()}] ${msg}`,
        ]);
    }, []);

    const refreshConfig = useCallback(async () => {
        if (!programId) {
            setProg(null);
            return;
        }
        const res = await fetchProgramConfig(connection, programId);
        setProg(res);
    }, [connection, programId]);

    useEffect(() => {
        let cancel = false;
        (async () => {
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

    const payer = useMemo(
        () => (wallet ? new PublicKey(wallet) : null),
        [wallet],
    );

    const trySync = useCallback(
        async (label: string, fn: () => Promise<{ ok: boolean; status: number }>) => {
            const r = await fn();
            append(`${label} → HTTP ${r.status} ${r.ok ? "OK" : "ERROR"}`);
        },
        [append],
    );

    const runStep = useCallback(
        async (
            key: string,
            action: () => Promise<string>,
            sync: (sig: string) => Promise<void>,
        ) => {
            if (!payer || !programId) {
                return;
            }
            setBusyKey(key);
            try {
                const sig = await action();
                append(`${key} · tx ${sig}`);
                await sync(sig);
                await refreshConfig();
            } catch (e) {
                const m = e instanceof Error ? e.message : String(e);
                append(`${key} · ERROR: ${m}`);
            } finally {
                setBusyKey(null);
            }
        },
        [payer, programId, refreshConfig, append],
    );

    const onInitialize = () =>
        runStep(
            "initialize",
            async () => {
                if (!payer || !programId) {
                    throw new Error("Wallet o programa no listo");
                }
                return confirmSerializedTx(
                    connection,
                    payer,
                    createInitializeIx({ programId, authority: payer }),
                );
            },
            async () => {
                /* Sin sync HTTP para initialize en Etapa 1 */
            },
        );

    const onRegisterActor = () =>
        runStep(
            "register_actor",
            async () => {
                if (!payer || !programId) {
                    throw new Error("Wallet o programa no listo");
                }
                return confirmSerializedTx(
                    connection,
                    payer,
                    createRegisterActorIx({
                        programId,
                        authority: payer,
                        role,
                        name: actorName.trim(),
                        location: actorLocation.trim(),
                    }),
                );
            },
            async (sig) => {
                if (!cfg.apiBaseUrl?.trim()) {
                    append("sync actor omitido: NEXT_PUBLIC_API_BASE_URL vacío");
                    return;
                }
                await trySync("sync actor", async () => {
                    const r = await postActorsSync(cfg.apiBaseUrl, { tx_hash: sig });
                    return { ok: r.ok, status: r.status };
                });
            },
        );

    const onCreateShipment = () =>
        runStep(
            "create_shipment",
            async () => {
                if (!payer || !programId) {
                    throw new Error("Wallet o programa no listo");
                }
                const cur = await fetchProgramConfig(connection, programId);
                if (!cur) {
                    throw new Error("ProgramConfig no disponible (¿initialize?)");
                }
                let rec: PublicKey;
                try {
                    rec = new PublicKey(recipient.trim());
                } catch {
                    throw new Error("Destinatario no es una PublicKey válida (base58).");
                }
                if (rec.equals(PublicKey.default)) {
                    throw new Error("Destinatario no puede ser Pubkey por defecto.");
                }
                const nextId = cur.decoded.shipmentsCreated + BigInt(1);
                const [ship] = shipmentPda(programId, nextId);

                const ix = createCreateShipmentIx({
                    programId,
                    sender: payer,
                    recipient: rec,
                    nextShipmentIndex: nextId,
                    product: product.trim(),
                    origin: origin.trim(),
                    destination: destination.trim(),
                    requiresColdChain: coldChain,
                });

                const sig = await confirmSerializedTx(connection, payer, ix);
                setShipmentAccount(ship);
                return sig;
            },
            async (sig) => {
                if (!cfg.apiBaseUrl?.trim()) {
                    append("sync envío omitido: NEXT_PUBLIC_API_BASE_URL vacío");
                    return;
                }
                await trySync("sync shipment", async () => {
                    const r = await postShipmentsSync(cfg.apiBaseUrl, { tx_hash: sig });
                    return { ok: r.ok, status: r.status };
                });
            },
        );

    const onRecordCheckpoint = () =>
        runStep(
            "record_checkpoint",
            async () => {
                if (!payer || !programId || !shipmentAccount) {
                    throw new Error("Falta wallet, programa o cuenta de envío.");
                }
                const cur = await fetchProgramConfig(connection, programId);
                if (!cur) {
                    throw new Error("ProgramConfig no disponible.");
                }
                const nextCp = cur.decoded.checkpointsRecorded + BigInt(1);
                const latNum: number | null = lat.trim() === "" ? null : Number(lat);
                const lngNum: number | null = lng.trim() === "" ? null : Number(lng);
                const tmpNum: number | null =
                    temp.trim() === "" ? null : Number.parseInt(temp, 10);
                const humNum: number | null =
                    humidity.trim() === ""
                        ? null
                        : Number.parseInt(humidity, 10);
                if (lat.trim() !== "" && Number.isNaN(latNum!)) {
                    throw new Error("Latitud inválida");
                }
                if (lng.trim() !== "" && Number.isNaN(lngNum!)) {
                    throw new Error("Longitud inválida");
                }
                if (temp.trim() !== "" && Number.isNaN(tmpNum!)) {
                    throw new Error("Temperatura inválida");
                }
                if (
                    humidity.trim() !== "" &&
                    (Number.isNaN(humNum!) || humNum! < 0 || humNum! > 255)
                ) {
                    throw new Error("Humedad inválida (0–255)");
                }

                return confirmSerializedTx(
                    connection,
                    payer,
                    createRecordCheckpointIx({
                        programId,
                        authority: payer,
                        shipment: shipmentAccount,
                        nextCheckpointIndex: nextCp,
                        checkpointType: cpType,
                        location: cpLocation.trim(),
                        latitude: latNum,
                        longitude: lngNum,
                        temperature: tmpNum,
                        humidity: humNum,
                        metadata: metadata.trim(),
                    }),
                );
            },
            async (sig) => {
                if (!cfg.apiBaseUrl?.trim()) {
                    append("sync checkpoint omitido: NEXT_PUBLIC_API_BASE_URL vacío");
                    return;
                }
                await trySync("sync checkpoint", async () => {
                    const r = await postCheckpointsSync(cfg.apiBaseUrl, {
                        tx_hash: sig,
                    });
                    return { ok: r.ok, status: r.status };
                });
            },
        );

    const configSummary = prog
        ? `actors=${prog.decoded.actorsRegistered} envíos=${prog.decoded.shipmentsCreated} checkpoints=${prog.decoded.checkpointsRecorded}`
        : programId
          ? "ProgramConfig no leído o programa sin initialize"
          : "Configure NEXT_PUBLIC_PROGRAM_ID válido";

    return (
        <div style={{ display: "grid", gap: "1.5rem" }}>
            <section className="card">
                <div className="card__hd">Wallet</div>
                <div className="card__bd">
                    <PhantomConnect onPublicKeyChange={setWallet} />
                </div>
            </section>

            {!programId ? (
                <p className="badge badge--danger">
                    Falta o es inválido{" "}
                    <code className="mono">NEXT_PUBLIC_PROGRAM_ID</code> en{" "}
                    <code className="mono">.env.local</code>.
                </p>
            ) : null}

            <section className="card">
                <div className="card__hd">Estado on-chain</div>
                <div className="card__bd">
                    <p className="text-sm text-muted mb-0">{configSummary}</p>
                    <button
                        type="button"
                        className="btn btn--ghost btn--sm mt-2"
                        onClick={() => void refreshConfig()}
                    >
                        Refrescar ProgramConfig
                    </button>
                    {shipmentAccount ? (
                        <p className="text-sm mt-2 mb-0">
                            Última cuenta de envío (PDA):{" "}
                            <span className="mono">{shipmentAccount.toBase58()}</span>
                        </p>
                    ) : null}
                </div>
            </section>

            <section className="card">
                <div className="card__hd">1 · Initialize (una vez)</div>
                <div className="card__bd">
                    <p className="text-sm text-muted">
                        Inicializa <code className="mono">ProgramConfig</code>. Omite si ya existe.
                    </p>
                    <button
                        type="button"
                        className="btn btn--primary"
                        disabled={!payer || !programId || busyKey !== null || !!prog}
                        onClick={() => void onInitialize()}
                    >
                        {busyKey === "initialize" ? "Enviando…" : "Ejecutar initialize"}
                    </button>
                </div>
            </section>

            <section className="card">
                <div className="card__hd">2 · Registrar actor</div>
                <div className="card__bd">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="role">Rol</label>
                            <select
                                id="role"
                                className="select"
                                value={role}
                                onChange={(e) =>
                                    setRole(Number(e.target.value) as ActorRoleCode)
                                }
                            >
                                {ROLE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="aname">Nombre</label>
                            <input
                                id="aname"
                                className="input"
                                value={actorName}
                                onChange={(e) => setActorName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="aloc">Ubicación</label>
                        <input
                            id="aloc"
                            className="input"
                            value={actorLocation}
                            onChange={(e) => setActorLocation(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn--primary"
                        disabled={!payer || !programId || !prog || busyKey !== null}
                        onClick={() => void onRegisterActor()}
                    >
                        {busyKey === "register_actor" ? "Enviando…" : "register_actor + sync"}
                    </button>
                </div>
            </section>

            <section className="card">
                <div className="card__hd">3 · Crear envío</div>
                <div className="card__bd">
                    <div className="form-group">
                        <label htmlFor="rec">Destinatario (PublicKey base58)</label>
                        <input
                            id="rec"
                            className="input mono"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="Pega otra wallet (puede ser la misma en localnet)"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="prod">Producto</label>
                            <input
                                id="prod"
                                className="input"
                                value={product}
                                onChange={(e) => setProduct(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cold">Cadena de frío</label>
                            <select
                                id="cold"
                                className="select"
                                value={coldChain ? "1" : "0"}
                                onChange={(e) => setColdChain(e.target.value === "1")}
                            >
                                <option value="0">No</option>
                                <option value="1">Sí</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="orig">Origen</label>
                        <input
                            id="orig"
                            className="input"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dest">Destino</label>
                        <input
                            id="dest"
                            className="input"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn--primary"
                        disabled={!payer || !programId || !prog || busyKey !== null}
                        onClick={() => void onCreateShipment()}
                    >
                        {busyKey === "create_shipment" ? "Enviando…" : "create_shipment + sync"}
                    </button>
                </div>
            </section>

            <section className="card">
                <div className="card__hd">4 · Registrar checkpoint</div>
                <div className="card__bd">
                    <p className="text-sm text-muted">
                        Tras crear el envío, el estado inicial es Created: usa{" "}
                        <strong>Pickup</strong> para avanzar a InTransit.
                    </p>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cpt">Tipo</label>
                            <select
                                id="cpt"
                                className="select"
                                value={cpType}
                                onChange={(e) =>
                                    setCpType(Number(e.target.value) as CheckpointTypeCode)
                                }
                            >
                                {CP_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="cpl">Lugar</label>
                            <input
                                id="cpl"
                                className="input"
                                value={cpLocation}
                                onChange={(e) => setCpLocation(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="lat">Lat (opc.)</label>
                            <input
                                id="lat"
                                className="input mono"
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lng">Lng (opc.)</label>
                            <input
                                id="lng"
                                className="input mono"
                                value={lng}
                                onChange={(e) => setLng(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tmp">Temperatura °C (opc., i16)</label>
                            <input
                                id="tmp"
                                className="input mono"
                                value={temp}
                                onChange={(e) => setTemp(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="hum">Humedad (opc., u8)</label>
                            <input
                                id="hum"
                                className="input mono"
                                value={humidity}
                                onChange={(e) => setHumidity(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="meta">Metadata</label>
                        <textarea
                            id="meta"
                            className="textarea"
                            value={metadata}
                            onChange={(e) => setMetadata(e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn--primary"
                        disabled={
                            !payer ||
                            !programId ||
                            !prog ||
                            !shipmentAccount ||
                            busyKey !== null
                        }
                        onClick={() => void onRecordCheckpoint()}
                    >
                        {busyKey === "record_checkpoint"
                            ? "Enviando…"
                            : "record_checkpoint + sync"}
                    </button>
                </div>
            </section>

            <section className="card">
                <div className="card__hd">Registro</div>
                <div className="card__bd">
                    <pre
                        className="mono text-sm"
                        style={{ maxHeight: 280, overflow: "auto", margin: 0 }}
                    >
                        {logs.length ? logs.join("\n") : "Aún sin eventos."}
                    </pre>
                </div>
            </section>
        </div>
    );
}
