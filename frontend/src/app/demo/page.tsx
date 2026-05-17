import { redirect } from "next/navigation";

/** Ruta legada: el flujo operativo vive en /admin. */
export default function DemoRedirectPage() {
    redirect("/admin");
}
