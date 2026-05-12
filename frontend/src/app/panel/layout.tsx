import { PanelEtapa2Rail } from "@/components/panel/PanelEtapa2Rail";

/**
 * Shell corporativo del área panel (Etapa 2): rail lateral con capacidades por rol + contenido.
 */
export default function PanelLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="panel-etapa2-shell">
            <PanelEtapa2Rail />
            <div className="panel-etapa2-main">{children}</div>
        </div>
    );
}
