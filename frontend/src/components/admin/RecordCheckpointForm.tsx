"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Connection, PublicKey } from "@solana/web3.js";

import { apiBaseHasV1Prefix, normalizeApiBaseUrl } from "@/lib/api/backendConnectivity";
import { loadCheckpointSelectOptions } from "@/lib/api/catalogs";
import { postCheckpointsSync } from "@/lib/api/sync";
import { getPublicConfig } from "@/lib/env";
import {
    catalogSourceLabel,
    syncSuccessCopy,
    userFacingChainError,
    userMessageForSyncFailure,
} from "@/lib/panel/etapa1UserMessages";
import type { CatalogOptionRow } from "@/lib/solana/catalogCodeMap";
import { confirmSerializedTx } from "@/lib/solana/confirmSerializedTx";
import type { CheckpointTypeCode } from "@/lib/solana/ix";
import { CheckpointTypeCode as Cp } from "@/lib/solana/ix";
import { createRecordCheckpointIx } from "@/lib/solana/instructions";
import { fetchProgramConfig } from "@/lib/solana/program_config";

const FALLBACK_CP_ROWS: CatalogOptionRow<CheckpointTypeCode>[] = [
    { code: "Pickup", label: "Pickup", value: Cp.Pickup },
    { code: "HubIn", label: "HubIn", value: Cp.HubIn },
    { code: "HubOut", label: "HubOut", value: Cp.HubOut },
    { code: "Transit", label: "Transit", value: Cp.Transit },
    { code: "DeliveryAttempt", label: "DeliveryAttempt", value: Cp.DeliveryAttempt },
    { code: "Delivered", label: "Delivered", value: Cp.Delivered },
    { code: "SensorData", label: "SensorData", value: Cp.SensorData },
];

export type RecordCheckpointFormProps = {
    connection: Connection;
    programId: PublicKey;
    payer: PublicKey;
    shipmentPda: PublicKey;
    onChainShipmentId: string;
    apiBaseUrl: string;
    onSuccess: () => void;
};

export function RecordCheckpointForm({
    connection,
    programId,
    payer,
    shipmentPda,
    onChainShipmentId,
    apiBaseUrl,
    onSuccess,
}: RecordCheckpointFormProps) {
    const cfg = useMemo(() => getPublicConfig(), []);
    const apiBaseTrimmed = useMemo(() => normalizeApiBaseUrl(cfg.apiBaseUrl ?? ""), [cfg.apiBaseUrl]);
    const apiBaseWellFormed = useMemo(
        () => apiBaseTrimmed !== "" && apiBaseHasV1Prefix(apiBaseTrimmed),
        [apiBaseTrimmed],
    );

    const [cpType, setCpType] = useState<CheckpointTypeCode>(Cp.Pickup);
    const [cpLocation, setCpLocation] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [temp, setTemp] = useState("");
    const [humidity, setHumidity] = useState("");
    const [metadata, setMetadata] = useState("{}");
    const [apiCpRows, setApiCpRows] = useState<CatalogOptionRow<CheckpointTypeCode>[] | null>(null);
    const [catalogsLoading, setCatalogsLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [banner, setBanner] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);

    const cpRows = apiCpRows ?? FALLBACK_CP_ROWS;

    useEffect(() => {
        let cancel = false;
        if (!apiBaseTrimmed || !apiBaseWellFormed) {
            queueMicrotask(() => {
                if (!cancel) {
                    setApiCpRows(null);
                    setCatalogsLoading(false);
                }
            });
            return () => {
                cancel = true;
            };
        }
        queueMicrotask(() => {
            if (!cancel) setCatalogsLoading(true);
        });
        void loadCheckpointSelectOptions(apiBaseTrimmed).then((opts) => {
            if (!cancel) {
                setApiCpRows(opts.length > 0 ? opts : null);
                setCatalogsLoading(false);
            }
        });
        return () => {
            cancel = true;
        };
    }, [apiBaseTrimmed, apiBaseWellFormed]);

    const onSubmit = useCallback(async () => {
        if (!cpLocation.trim()) {
            setBanner({ kind: "err", text: "Indique el lugar del evento." });
            return;
        }
        setBusy(true);
        setBanner(null);
        try {
            const cur = await fetchProgramConfig(connection, programId);
            if (!cur) throw new Error("Programa no activo");
            const nextCp = cur.decoded.checkpointsRecorded + BigInt(1);
            const latNum: number | null = lat.trim() === "" ? null : Number(lat);
            const lngNum: number | null = lng.trim() === "" ? null : Number(lng);
            const tmpNum: number | null = temp.trim() === "" ? null : Number.parseInt(temp, 10);
            const humNum: number | null =
                humidity.trim() === "" ? null : Number.parseInt(humidity, 10);
            const sig = await confirmSerializedTx(
                connection,
                payer,
                createRecordCheckpointIx({
                    programId,
                    authority: payer,
                    shipment: shipmentPda,
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
            if (apiBaseUrl.trim()) {
                const r = await postCheckpointsSync(apiBaseUrl, { tx_hash: sig });
                if (r.ok) {
                    setBanner({ kind: "ok", text: syncSuccessCopy.checkpoint });
                } else {
                    setBanner({
                        kind: "err",
                        text: userMessageForSyncFailure("el evento", r.status, r.json),
                    });
                }
            } else {
                setBanner({
                    kind: "info",
                    text: "Evento registrado en cadena. Configure la API para sincronizar.",
                });
            }
            onSuccess();
        } catch (e) {
            const m = e instanceof Error ? e.message : String(e);
            setBanner({ kind: "err", text: userFacingChainError("record_checkpoint", m) });
        } finally {
            setBusy(false);
        }
    }, [
        connection,
        programId,
        payer,
        shipmentPda,
        cpType,
        cpLocation,
        lat,
        lng,
        temp,
        humidity,
        metadata,
        apiBaseUrl,
        onSuccess,
    ]);

    const footnote = catalogSourceLabel({
        loading: catalogsLoading,
        fromApi: Boolean(apiBaseWellFormed && apiCpRows),
    });

    return (
        <form
            className="admin-form"
            onSubmit={(e) => {
                e.preventDefault();
                void onSubmit();
            }}
        >
            <p className="text-sm text-muted mb-2">
                Envío on-chain <span className="mono">#{onChainShipmentId}</span>
            </p>
            <p className="text-sm text-muted mb-2">{footnote}</p>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="admin-cp-type">Tipo de evento</label>
                    <select
                        id="admin-cp-type"
                        className="select"
                        value={cpType}
                        disabled={catalogsLoading || busy}
                        onChange={(e) => setCpType(Number(e.target.value) as CheckpointTypeCode)}
                    >
                        {cpRows.map((o) => (
                            <option key={o.code} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="admin-cp-loc">Lugar</label>
                    <input
                        id="admin-cp-loc"
                        className="input"
                        value={cpLocation}
                        disabled={busy}
                        onChange={(e) => setCpLocation(e.target.value)}
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="admin-cp-lat">Lat (opc.)</label>
                    <input
                        id="admin-cp-lat"
                        className="input mono"
                        value={lat}
                        disabled={busy}
                        onChange={(e) => setLat(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="admin-cp-lng">Lng (opc.)</label>
                    <input
                        id="admin-cp-lng"
                        className="input mono"
                        value={lng}
                        disabled={busy}
                        onChange={(e) => setLng(e.target.value)}
                    />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="admin-cp-temp">Temp. °C (opc.)</label>
                    <input
                        id="admin-cp-temp"
                        className="input mono"
                        value={temp}
                        disabled={busy}
                        onChange={(e) => setTemp(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="admin-cp-hum">Humedad (opc.)</label>
                    <input
                        id="admin-cp-hum"
                        className="input mono"
                        value={humidity}
                        disabled={busy}
                        onChange={(e) => setHumidity(e.target.value)}
                    />
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="admin-cp-meta">Metadata JSON</label>
                <input id="admin-cp-meta" className="input mono" value={metadata} disabled={busy} onChange={(e) => setMetadata(e.target.value)} />
            </div>

            <button
                type="submit"
                className={`btn btn--primary btn--block${busy ? " is-busy" : ""}`}
                disabled={busy || !cpLocation.trim()}
                aria-busy={busy}
            >
                {busy ? "Firmando…" : "Registrar evento"}
            </button>
            {banner ? (
                <p
                    className={`text-sm mt-2 mb-0${banner.kind === "err" ? " admin-form__err" : ""}`}
                    role={banner.kind === "err" ? "alert" : "status"}
                >
                    {banner.text}
                </p>
            ) : null}
        </form>
    );
}
