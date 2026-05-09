import type { Metadata } from "next";

import { Etapa1Demo } from "@/components/Etapa1Demo";

export const metadata: Metadata = {
    title: "Demo Etapa 1 · TraceSol Logistics",
};

export default function DemoPage() {
    return (
        <main className="page-main">
            <div className="shell">
                <h1 className="page-title">Demo Etapa 1</h1>
                <p className="page-sub">
                    Secuencia on-chain (<code className="mono">initialize → register_actor → create_shipment → record_checkpoint</code>) y llamadas POST a{" "}
                    <code className="mono">/api/v1/…/sync</code>.
                </p>
                <Etapa1Demo />
            </div>
        </main>
    );
}
