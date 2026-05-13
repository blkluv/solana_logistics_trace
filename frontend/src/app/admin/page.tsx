"use client";

import Link from "next/link";

import { canUseChainOperationsNav } from "@/lib/panel/capabilities";
import { useWalletSession } from "@/lib/wallet/WalletSessionContext";

function roleCards(role: string | null): { title: string; body: string; href?: string; label?: string }[] {
    switch (role) {
        case "Sender":
            return [
                {
                    title: "Resumen y envíos",
                    body: "Dashboard por rol, KPIs y listado en el panel operativo.",
                    href: "/panel",
                    label: "Abrir resumen",
                },
                {
                    title: "Alta de envíos",
                    body: "Cree envíos con firma en Solana y sincronización al backend.",
                    href: "/panel/envios",
                    label: "Ir a envíos",
                },
                {
                    title: "Operaciones en cadena",
                    body: "Inicialización del programa, actores, envíos y checkpoints firmados.",
                    href: "/demo",
                    label: "Abrir operaciones",
                },
            ];
        case "Carrier":
            return [
                {
                    title: "Panel operativo",
                    body: "Consulte envíos donde intervenga su cartera y registre checkpoints.",
                    href: "/panel",
                    label: "Resumen",
                },
                {
                    title: "Listado de envíos",
                    body: "Vista detallada y enlaces al detalle con mapa y línea de tiempo.",
                    href: "/panel/envios",
                    label: "Ir a envíos",
                },
                {
                    title: "Operaciones en cadena",
                    body: "Firma de checkpoints y sincronización.",
                    href: "/demo",
                    label: "Abrir operaciones",
                },
            ];
        case "Hub":
            return [
                {
                    title: "Panel operativo",
                    body: "Resumen de envíos y eventos vinculados a su nodo.",
                    href: "/panel",
                    label: "Resumen",
                },
                {
                    title: "Operaciones en cadena",
                    body: "Registro de eventos logísticos con firma.",
                    href: "/demo",
                    label: "Abrir operaciones",
                },
            ];
        case "Recipient":
            return [
                {
                    title: "Seguimiento",
                    body: "Envíos donde figura como destinatario.",
                    href: "/panel/envios",
                    label: "Ir a envíos",
                },
                {
                    title: "Resumen",
                    body: "Indicadores y accesos rápidos del panel.",
                    href: "/panel",
                    label: "Abrir resumen",
                },
            ];
        case "Inspector":
            return [
                {
                    title: "Auditoría",
                    body: "Rol de solo lectura: consulte envíos autorizados sin operaciones de firma.",
                    href: "/panel/envios",
                    label: "Consultar envíos",
                },
                {
                    title: "Resumen",
                    body: "Vista general del panel operativo.",
                    href: "/panel",
                    label: "Abrir resumen",
                },
            ];
        default:
            return [
                {
                    title: "Registro de actor",
                    body: "Conecte la wallet y complete el alta como actor para desbloquear el panel por rol.",
                    href: "/registro",
                    label: "Ir a registro",
                },
                {
                    title: "Panel operativo",
                    body: "Tras el registro, el resumen y los envíos se adaptan a su rol.",
                    href: "/panel",
                    label: "Abrir panel",
                },
            ];
    }
}

export default function AdminHomePage() {
    const { wallet, role, actorLoading } = useWalletSession();
    const showChainOps = canUseChainOperationsNav(Boolean(wallet), role);
    const cards = roleCards(role);

    return (
        <>
            <h1 className="page-title">Administración y sync</h1>
            <p className="page-sub">
                Accesos según el rol devuelto por el backend para la wallet conectada. El trabajo
                cotidiano está en el panel operativo; aquí se concentran enlaces de apoyo.
            </p>

            {!wallet && (
                <p className="text-muted text-sm" role="status">
                    Conecte la wallet desde el encabezado para cargar su rol y opciones.
                </p>
            )}

            {wallet && actorLoading && <p className="text-muted text-sm">Cargando rol…</p>}

            {wallet && !actorLoading && (
                <p className="text-sm">
                    Rol actual: <strong>{role ?? "—"}</strong>
                </p>
            )}

            <div className="layout-split layout-split--2-1 mt-2">
                <div className="stack-cards">
                    {cards.map((c) => (
                        <section key={c.title} className="card">
                            <div className="card__hd">{c.title}</div>
                            <div className="card__bd text-sm">
                                <p className="mb-2">{c.body}</p>
                                {c.href && c.label && (
                                    <Link prefetch={false} className="btn btn--secondary btn--sm" href={c.href}>
                                        {c.label}
                                    </Link>
                                )}
                            </div>
                        </section>
                    ))}
                </div>
                <div>
                    <section className="card">
                        <div className="card__hd">Accesos rápidos</div>
                        <div className="card__bd text-sm stack-links">
                            <Link prefetch={false} className="btn btn--ghost btn--sm" href="/panel">
                                Panel — resumen
                            </Link>
                            <Link prefetch={false} className="btn btn--ghost btn--sm" href="/panel/envios">
                                Panel — envíos
                            </Link>
                            <Link prefetch={false} className="btn btn--ghost btn--sm" href="/consola">
                                Consola del sistema
                            </Link>
                            <Link prefetch={false} className="btn btn--ghost btn--sm" href="/sistema">
                                Red y programa (.env)
                            </Link>
                            {showChainOps ? (
                                <Link prefetch={false} className="btn btn--ghost btn--sm" href="/demo">
                                    Operaciones en cadena
                                </Link>
                            ) : (
                                <p className="text-muted mb-0">
                                    Operaciones en cadena no aplican (Inspector o sin wallet).
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
