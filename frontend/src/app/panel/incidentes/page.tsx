"use client";

import { IncidentHubWorkspace } from "@/components/incidents/IncidentHubWorkspace";
import { getPublicConfig } from "@/lib/env";
import { useWalletSession } from "@/lib/wallet/WalletSessionContext";

export default function PanelIncidentesPage() {
    const { apiBaseUrl } = getPublicConfig();
    const { wallet, connect, connectError } = useWalletSession();
    const base = apiBaseUrl?.trim() ?? "";

    if (!base) {
        return (
            <main className="page-main">
                <div className="shell">
                    <h1 className="page-title">Centro de incidencias</h1>
                    <p className="text-muted text-sm" role="status">
                        Configure <code className="mono">NEXT_PUBLIC_API_BASE_URL</code>.
                    </p>
                </div>
            </main>
        );
    }

    if (!wallet) {
        return (
            <main className="page-main">
                <div className="shell">
                    <h1 className="page-title">Centro de incidencias</h1>
                    <p className="page-sub">
                        Conecte su wallet para ver indicadores, filtrar alertas y acceder al detalle
                        de cada envío.
                    </p>
                    {connectError ? (
                        <p className="text-sm admin-form__err" role="alert">
                            {connectError}
                        </p>
                    ) : null}
                    <p className="mt-2 mb-0">
                        <button type="button" className="btn btn--primary" onClick={() => void connect()}>
                            Conectar wallet
                        </button>
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="page-main page-main--admin">
            <div className="shell">
                <IncidentHubWorkspace apiBaseUrl={base} />
            </div>
        </main>
    );
}
