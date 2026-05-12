/**
 * Contenedor del área admin: mismo ritmo vertical que el resto del sitio (mockup TraceSol).
 */
export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="page-main">
            <div className="shell content-narrow">{children}</div>
        </main>
    );
}
