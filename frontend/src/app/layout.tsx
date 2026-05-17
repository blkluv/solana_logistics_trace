import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/components/providers/AppProviders";
import { DeferredSiteHeader } from "@/components/layout/SiteHeaderLoader";
import { SiteFooter } from "@/components/layout/SiteFooter";

import "@/styles/tracesol.css";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "TraceSol Logistics · Trazabilidad",
    description:
        "Trazabilidad logística: panel operativo, actor, envíos y checkpoints en Solana con sincronización al backend.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" className={inter.variable} suppressHydrationWarning>
            <body suppressHydrationWarning>
                <AppProviders>
                    <DeferredSiteHeader />
                    {children}
                    <SiteFooter />
                </AppProviders>
            </body>
        </html>
    );
}
