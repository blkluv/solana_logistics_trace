/**
 * Área de administración: layout amplio para el proceso operativo.
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
