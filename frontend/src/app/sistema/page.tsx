import { ClusterPanel } from "@/components/ClusterPanel";
import { PhantomConnect } from "@/components/PhantomConnect";
import { getPublicConfig } from "@/lib/env";

export default function SistemaPage() {
    const cfg = getPublicConfig();

    return (
        <main className="page-main">
            <div className="shell">
                <h1 className="page-title">Sistema y red</h1>
                <p className="page-sub">
                    Identificadores públicos desde <code className="mono">NEXT_PUBLIC_*</code> y
                    comprobación de RPC mediante la ruta proxy de Next.
                </p>
                <div style={{ display: "grid", gap: "1.25rem", maxWidth: "42rem" }}>
                    <ClusterPanel
                        network={cfg.network}
                        rpcUrl={cfg.rpcUrl}
                        programId={cfg.programId}
                    />
                    <section className="card">
                        <div className="card__hd">Wallet de prueba</div>
                        <div className="card__bd">
                            <PhantomConnect />
                        </div>
                    </section>
                </div>
                {cfg.apiBaseUrl ? (
                    <p className="text-sm text-muted mt-2 mono break-all mb-0">
                        API base: {cfg.apiBaseUrl}
                    </p>
                ) : null}
            </div>
        </main>
    );
}
