/**
 * Área de administración: dashboard de envíos y detalle.
 */
export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="page-main page-main--admin">
            <div className="shell">{children}</div>
        </main>
    );
}
