import Link from "next/link";

/**
 * Shell corporativo del área panel (Etapa 2): rail lateral + contenido.
 */
export default function PanelLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="panel-etapa2-shell">
            <aside className="panel-etapa2-rail" aria-label="Navegación del panel">
                <div className="panel-etapa2-rail__brand">Panel operativo</div>
                <nav className="panel-etapa2-rail__nav">
                    <Link prefetch={false} className="panel-etapa2-rail__link" href="/panel">
                        Resumen
                    </Link>
                    <Link prefetch={false} className="panel-etapa2-rail__link" href="/panel/envios">
                        Envíos
                    </Link>
                    <Link prefetch={false} className="panel-etapa2-rail__link" href="/demo">
                        Operaciones on-chain
                    </Link>
                    <Link prefetch={false} className="panel-etapa2-rail__link" href="/sistema">
                        Sistema
                    </Link>
                </nav>
            </aside>
            <div className="panel-etapa2-main">{children}</div>
        </div>
    );
}
