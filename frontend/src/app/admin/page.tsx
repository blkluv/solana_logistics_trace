"use client";

import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { useWalletSession } from "@/lib/wallet/WalletSessionContext";

export default function AdminHomePage() {
    const { wallet, connect, connectError } = useWalletSession();

    if (!wallet) {
        return (
            <>
                <h1 className="page-title">Administración</h1>
                <p className="page-sub">
                    Conecte su wallet con Phantom para acceder al dashboard de envíos y eventos
                    logísticos.
                </p>
                {connectError ? (
                    <p className="text-sm admin-form__err" role="alert">
                        {connectError}
                    </p>
                ) : null}
                <p className="mt-2 mb-0">
                    <button type="button" className="btn btn--primary" onClick={() => void connect()}>
                        Conectar wallet
                    </button>
                </p>
            </>
        );
    }

    return <AdminWorkspace />;
}
