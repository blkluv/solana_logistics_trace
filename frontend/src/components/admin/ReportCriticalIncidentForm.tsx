"use client";

import { useCallback, useEffect, useState } from "react";
import type { Connection, PublicKey } from "@solana/web3.js";

import type { IncidentItem } from "@/lib/api/incidents";
import { apiBaseHasV1Prefix, normalizeApiBaseUrl } from "@/lib/api/backendConnectivity";
import { postIncidentsSync } from "@/lib/api/sync";
import { postSyncWithRetry } from "@/lib/api/syncWithRetry";
import { sha256EvidenceJson } from "@/lib/incidents/evidenceHash";
import {
    buildAnchorEvidencePayload,
    mapAutoIncidentToOnChainType,
    onChainSeverityFromAuto,
} from "@/lib/incidents/anchorOnChain";
import { incidentTypeLabel } from "@/lib/incidents/display";
import { userFacingChainError, userMessageForSyncFailure } from "@/lib/panel/etapa1UserMessages";
import { confirmSerializedTx } from "@/lib/solana/confirmSerializedTx";
import { createReportCriticalIncidentIx } from "@/lib/solana/instructions";
import {
    CriticalIncidentTypeCode,
    OnChainIncidentSeverityCode,
} from "@/lib/solana/ix";

const INCIDENT_TYPE_OPTIONS: { code: CriticalIncidentTypeCode; key: string }[] = [
    { key: "TempViolation", code: CriticalIncidentTypeCode.TempViolation },
    { key: "Damage", code: CriticalIncidentTypeCode.Damage },
    { key: "Delay", code: CriticalIncidentTypeCode.Delay },
    { key: "Lost", code: CriticalIncidentTypeCode.Lost },
    { key: "Unauthorized", code: CriticalIncidentTypeCode.Unauthorized },
    { key: "Other", code: CriticalIncidentTypeCode.Other },
];

function typeKeyFromCode(code: CriticalIncidentTypeCode): string {
    return INCIDENT_TYPE_OPTIONS.find((o) => o.code === code)?.key ?? "Other";
}

export type ReportCriticalIncidentFormProps = {
    connection: Connection;
    programId: PublicKey;
    payer: PublicKey;
    shipmentPda: PublicKey;
    shipmentServiceId: string;
    apiBaseUrl: string;
    /** Incidencia automática del motor a anclar on-chain (opcional). */
    anchorIncident?: IncidentItem | null;
    onSuccess: () => void;
};

export function ReportCriticalIncidentForm({
    connection,
    programId,
    payer,
    shipmentPda,
    shipmentServiceId,
    apiBaseUrl,
    anchorIncident = null,
    onSuccess,
}: ReportCriticalIncidentFormProps) {
    const [typeKey, setTypeKey] = useState("TempViolation");
    const [severity, setSeverity] = useState<"High" | "Critical">("High");
    const [description, setDescription] = useState("");
    const [busy, setBusy] = useState(false);
    const [banner, setBanner] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);

    const apiBaseTrimmed = normalizeApiBaseUrl(apiBaseUrl ?? "");
    const apiOk = apiBaseTrimmed !== "" && apiBaseHasV1Prefix(apiBaseTrimmed);

    useEffect(() => {
        if (!anchorIncident) {
            return;
        }
        const mapped = mapAutoIncidentToOnChainType(anchorIncident.incidentType);
        setTypeKey(typeKeyFromCode(mapped));
        setSeverity(onChainSeverityFromAuto(anchorIncident.severity));
        setDescription(anchorIncident.description.slice(0, 256));
    }, [anchorIncident]);

    const onSubmit = useCallback(async () => {
        const desc = description.trim();
        if (!desc) {
            setBanner({ kind: "err", text: "Describa la incidencia." });
            return;
        }
        const typeOpt = INCIDENT_TYPE_OPTIONS.find((o) => o.key === typeKey);
        if (!typeOpt) {
            setBanner({ kind: "err", text: "Seleccione un tipo de incidencia." });
            return;
        }

        setBusy(true);
        setBanner(null);
        try {
            const severityLabel = severity;
            const evidence = anchorIncident
                ? buildAnchorEvidencePayload(
                      shipmentServiceId,
                      anchorIncident,
                      typeOpt.key,
                      severityLabel,
                      desc,
                  )
                : {
                      shipmentId: shipmentServiceId,
                      incidentType: typeOpt.key,
                      severity: severityLabel,
                      description: desc,
                      reportedAt: new Date().toISOString(),
                  };
            const hashBytes = await sha256EvidenceJson(evidence);
            const severityCode =
                severity === "Critical"
                    ? OnChainIncidentSeverityCode.Critical
                    : OnChainIncidentSeverityCode.High;

            const ix = createReportCriticalIncidentIx({
                programId,
                reporter: payer,
                shipment: shipmentPda,
                incidentType: typeOpt.code,
                severity: severityCode,
                evidenceHash: hashBytes,
                description: desc.slice(0, 256),
            });
            const sig = await confirmSerializedTx(connection, payer, ix);

            if (apiOk) {
                const syncBody = {
                    tx_hash: sig,
                    ...(anchorIncident ? { anchor_incident_id: anchorIncident.id } : {}),
                };
                const r = await postSyncWithRetry(() =>
                    postIncidentsSync(apiBaseTrimmed, syncBody),
                );
                if (r.ok) {
                    setBanner({
                        kind: "ok",
                        text: anchorIncident
                            ? `Incidencia del motor anclada on-chain (${sig.slice(0, 16)}…).`
                            : `Incidencia crítica registrada y sincronizada (${sig.slice(0, 16)}…).`,
                    });
                    onSuccess();
                } else if (r.status === 404 || r.status === 501) {
                    setBanner({
                        kind: "info",
                        text: `Transacción confirmada (${sig.slice(0, 16)}…). Reintente sincronizar desde la consola si no aparece en el listado.`,
                    });
                    onSuccess();
                } else {
                    setBanner({
                        kind: "err",
                        text: `On-chain OK (${sig.slice(0, 12)}…), pero ${userMessageForSyncFailure("la incidencia", r.status, r.json).toLowerCase()}`,
                    });
                }
            } else {
                setBanner({
                    kind: "info",
                    text: `Incidencia registrada en cadena (${sig.slice(0, 20)}…). Configure la API para sincronizar.`,
                });
                onSuccess();
            }
        } catch (e) {
            const m = e instanceof Error ? e.message : String(e);
            setBanner({ kind: "err", text: userFacingChainError("report_critical_incident", m) });
        } finally {
            setBusy(false);
        }
    }, [
        anchorIncident,
        apiBaseTrimmed,
        apiOk,
        connection,
        description,
        onSuccess,
        payer,
        programId,
        severity,
        shipmentPda,
        shipmentServiceId,
        typeKey,
    ]);

    return (
        <form
            className="admin-form"
            onSubmit={(e) => {
                e.preventDefault();
                void onSubmit();
            }}
        >
            {anchorIncident ? (
                <p className="admin-form__info text-sm mb-3" role="status">
                    Anclando detección automática:{" "}
                    <strong>{incidentTypeLabel(anchorIncident.incidentType)}</strong>
                    {anchorIncident.ruleName ? ` (${anchorIncident.ruleName})` : ""}. Revise el
                    texto y firme para registrar en Solana.
                </p>
            ) : (
                <p className="text-xs text-muted mb-3">
                    Las incidencias <strong>críticas</strong> se firman en Solana. Las detecciones del
                    motor pueden anclarse desde la tarjeta de la incidencia.
                </p>
            )}
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="crit-inc-type">Tipo</label>
                    <select
                        id="crit-inc-type"
                        className="select"
                        value={typeKey}
                        disabled={busy}
                        onChange={(e) => setTypeKey(e.target.value)}
                    >
                        {INCIDENT_TYPE_OPTIONS.map((o) => (
                            <option key={o.key} value={o.key}>
                                {incidentTypeLabel(o.key)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="crit-inc-sev">Severidad on-chain</label>
                    <select
                        id="crit-inc-sev"
                        className="select"
                        value={severity}
                        disabled={busy}
                        onChange={(e) => setSeverity(e.target.value as "High" | "Critical")}
                    >
                        <option value="High">Alta</option>
                        <option value="Critical">Crítica</option>
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="crit-inc-desc">Descripción</label>
                <textarea
                    id="crit-inc-desc"
                    className="input"
                    rows={4}
                    maxLength={256}
                    value={description}
                    disabled={busy}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalle operativo visible en backend y hash de evidencia on-chain."
                />
                <p className="text-xs text-muted mb-0 mt-1">{description.length}/256 caracteres</p>
            </div>
            <button
                type="submit"
                className={`btn btn--primary btn--block${busy ? " is-busy" : ""}`}
                disabled={busy || !description.trim()}
                aria-busy={busy}
            >
                {busy
                    ? "Firmando y sincronizando…"
                    : anchorIncident
                      ? "Firmar y registrar en blockchain"
                      : "Reportar incidencia crítica"}
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
