"use client";

import { useState } from "react";

import { PhantomConnect } from "@/components/PhantomConnect";
import { ShipmentTracker } from "@/components/panel/ShipmentTracker";
import { getPublicConfig } from "@/lib/env";

export default function EnviosPage() {
    const { apiBaseUrl } = getPublicConfig();
    const [wallet, setWallet] = useState<string | null>(null);

    return (
        <main className="page-main">
            <div className="shell">
                <h1 className="page-title">Envíos</h1>
                <p className="page-sub">
                    Listado desde el backend (`GET /api/v1/shipments`) con wallet conectada.
                </p>

                <div className="card">
                    <div className="card__hd">Wallet</div>
                    <div className="card__bd">
                        <PhantomConnect onPublicKeyChange={setWallet} />
                    </div>
                </div>

                {!apiBaseUrl && (
                    <p className="text-muted text-sm mt-2" role="status">
                        Configura <code className="mono">NEXT_PUBLIC_API_BASE_URL</code> (p. ej.{" "}
                        <span className="mono">http://127.0.0.1:8000/api/v1</span>).
                    </p>
                )}

                {apiBaseUrl && wallet && (
                    <div className="mt-2">
                        <ShipmentTracker apiBaseUrl={apiBaseUrl} wallet={wallet} />
                    </div>
                )}

                {apiBaseUrl && !wallet && (
                    <p className="text-muted text-sm mt-2">Conecta Phantom para cargar envíos.</p>
                )}
            </div>
        </main>
    );
}
