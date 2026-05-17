import { ActorRegistrationForm } from "@/components/registro/ActorRegistrationForm";

/**
 * Alta de actor: solo formulario (firma Phantom vía barra superior).
 * Maquetación de referencia: `TMF-Docs/imagenes/*.png` y `TMF-Docs/tracesol-preview/`.
 */
export default function RegistroActorPage() {
    return (
        <main className="page-main page-main--registro">
            <div className="shell">
                <div className="registro-page">
                    <ActorRegistrationForm />
                </div>
            </div>
        </main>
    );
}
