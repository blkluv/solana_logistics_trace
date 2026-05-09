import Link from "next/link";

/** Contenido de inicio inspirado en TMF-Docs/tracesol-preview/index.html */
export function LandingHome() {
    return (
        <main className="page-main">
            <div className="shell">
                <section className="hero">
                    <div>
                        <h1 className="hero__title">
                            De la carga al cliente: una historia clara, con respaldo cuando cuenta
                        </h1>
                        <p className="hero__lead">
                            <strong>TraceSol</strong> conecta operación diaria con pruebas en{" "}
                            <strong>Solana</strong>: actor, envío y checkpoint, sincronizados con el
                            backend vía <code className="mono">POST …/sync</code>.
                        </p>
                        <div className="tag-row">
                            <span className="tag">Etapa 1 on-chain</span>
                            <span className="tag">Idempotencia por tx</span>
                            <span className="tag">Phantom en el navegador</span>
                        </div>
                        <div className="hero__cta">
                            <Link className="btn btn--primary" href="/demo">
                                Abrir demo técnica
                            </Link>
                            <Link className="btn btn--secondary" href="/panel">
                                Ver panel (mock)
                            </Link>
                        </div>
                    </div>
                    <div>
                        <div className="hero-visual">
                            <div
                                className="media-slot media-slot--hero"
                                role="img"
                                aria-label="Espacio reservado para imagen de la operación"
                            >
                                <span className="media-slot__label">Maqueta TraceSol</span>
                                <span className="media-slot__hint">
                                    Paleta y componentes alineados a tracesol-preview (teal
                                    #45818e).
                                </span>
                            </div>
                        </div>
                        <div className="signup-card">
                            <h3>Siguiente paso</h3>
                            <p className="text-sm text-muted mb-0" style={{ marginBottom: "1rem" }}>
                                Despliega el programa Anchor, configura{" "}
                                <code className="mono">NEXT_PUBLIC_*</code> en{" "}
                                <code className="mono">.env.local</code> y ejecuta el flujo
                                secuencial en la página Demo.
                            </p>
                            <Link className="btn btn--primary btn--block" href="/sistema">
                                Revisar RPC y program ID
                            </Link>
                        </div>
                    </div>
                </section>

                <section id="que-ofrece" className="mt-2">
                    <div className="section-head">
                        <h2>Qué cubre el frontend en Etapa 1</h2>
                        <p>
                            Transacciones alineadas al programa{" "}
                            <code className="mono">logistics_traceability</code> y llamadas al API
                            de sincronización.
                        </p>
                    </div>
                    <div className="feature-grid">
                        <article className="feature">
                            <div className="feature__icon">①</div>
                            <h3>Registrar actor</h3>
                            <p>
                                Instrucción <code className="mono">register_actor</code> con rol,
                                nombre y ubicación; luego <code className="mono">/actors/sync</code>.
                            </p>
                            <small>Rol y strings acotados al programa Anchor.</small>
                        </article>
                        <article className="feature">
                            <div className="feature__icon">②</div>
                            <h3>Crear envío</h3>
                            <p>
                                <code className="mono">create_shipment</code> con producto, ruta y
                                destinatario; sync en <code className="mono">/shipments/sync</code>.
                            </p>
                            <small>IDs correlativos desde ProgramConfig on-chain.</small>
                        </article>
                        <article className="feature">
                            <div className="feature__icon">③</div>
                            <h3>Registrar checkpoint</h3>
                            <p>
                                <code className="mono">record_checkpoint</code> y{" "}
                                <code className="mono">/checkpoints/sync</code> con el mismo{" "}
                                <code className="mono">tx_hash</code>.
                            </p>
                            <small>Primera transición típica: Pickup desde estado Created.</small>
                        </article>
                    </div>
                </section>

                <section className="card mt-2">
                    <div className="card__bd">
                        <div className="flex-between">
                            <div>
                                <h2 className="page-title mb-0">Explorar la app</h2>
                                <p className="text-muted text-sm mt-1">
                                    Panel demo, flujo técnico Etapa 1 y vista de configuración Solana.
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                <Link className="btn btn--primary" href="/demo">
                                    Demo Etapa 1
                                </Link>
                                <Link className="btn btn--secondary" href="/panel">
                                    Panel operativo
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
