"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getActorMe } from "@/lib/api/shipments";
import {
    canAccessOnChainOperationsPanel,
    canOpenShipmentTracker,
    isKnownActorRole,
} from "@/lib/panel/capabilities";
import { getPublicConfig } from "@/lib/env";
import { getPhantom } from "@/lib/wallet/phantom";

function linkClass(active: boolean): string {
    return `panel-etapa2-rail__link${active ? " is-active" : ""}`;
}

export function PanelEtapa2Rail() {
    const pathname = usePathname();
    const { apiBaseUrl } = getPublicConfig();
    const [wallet, setWallet] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    const trySilentWallet = useCallback(async () => {
        const p = getPhantom();
        if (!p?.isPhantom || !p.connect) {
            return;
        }
        try {
            const out = await p.connect({ onlyIfTrusted: true });
            setWallet(out.publicKey.toBase58());
        } catch {
            /* sin sesión previa */
        }
    }, []);

    useEffect(() => {
        void trySilentWallet();
    }, [trySilentWallet]);

    useEffect(() => {
        if (!apiBaseUrl || !wallet) {
            setRole(null);
            return;
        }
        let cancelled = false;
        void (async () => {
            const res = await getActorMe(apiBaseUrl, wallet);
            if (cancelled) {
                return;
            }
            if (res.ok) {
                setRole(res.data.role);
            } else {
                setRole(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [apiBaseUrl, wallet]);

    const enviosActive = pathname.startsWith("/panel/envios");
    const panelRootActive = pathname === "/panel";
    const showOps = canAccessOnChainOperationsPanel(role);
    const enviosEnabled = canOpenShipmentTracker(Boolean(wallet));

    return (
        <aside className="panel-etapa2-rail" aria-label="Navegación del panel">
            <div className="panel-etapa2-rail__brand">Panel operativo</div>
            {role && isKnownActorRole(role) && (
                <p className="panel-etapa2-rail__role text-xs text-muted mb-2 mt-0" data-testid="panel-role-badge">
                    Rol: <strong>{role}</strong>
                </p>
            )}
            <nav className="panel-etapa2-rail__nav">
                <Link prefetch={false} className={linkClass(panelRootActive)} href="/panel">
                    Resumen
                </Link>
                <Link
                    prefetch={false}
                    className={`${linkClass(enviosActive)}${!enviosEnabled ? " panel-etapa2-rail__link--muted" : ""}`}
                    href="/panel/envios"
                    title={!enviosEnabled ? "Conecta Phantom para consultar envíos" : undefined}
                >
                    Envíos
                </Link>
                {showOps && (
                    <Link prefetch={false} className={linkClass(pathname.startsWith("/demo"))} href="/demo">
                        Operaciones on-chain
                    </Link>
                )}
                <Link prefetch={false} className={linkClass(pathname.startsWith("/sistema"))} href="/sistema">
                    Sistema
                </Link>
            </nav>
        </aside>
    );
}
