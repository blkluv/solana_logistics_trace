import type { ReactNode } from "react";

export type ConsolaStatusTone = "ok" | "warn" | "err" | "neutral" | "loading";

export type ConsolaStatusCardProps = {
    icon: ReactNode;
    title: string;
    subtitle?: string;
    tone: ConsolaStatusTone;
    statusLabel: string;
    children: ReactNode;
    testId?: string;
};

export function ConsolaStatusCard({
    icon,
    title,
    subtitle,
    tone,
    statusLabel,
    children,
    testId,
}: ConsolaStatusCardProps) {
    return (
        <section
            className="consola-card"
            data-testid={testId}
            aria-label={title}
        >
            <div className="consola-card__head">
                <span className="consola-card__icon" aria-hidden>
                    {icon}
                </span>
                <div className="consola-card__titles">
                    <h2 className="consola-card__title">{title}</h2>
                    {subtitle ? <p className="consola-card__subtitle">{subtitle}</p> : null}
                </div>
                <span className={`consola-status consola-status--${tone}`}>{statusLabel}</span>
            </div>
            <div className="consola-card__body">{children}</div>
        </section>
    );
}

export function healthToneFromText(text: string): ConsolaStatusTone {
    const t = text.toLowerCase();
    if (t === "—" || t.includes("comprobando") || t.includes("…")) {
        return "loading";
    }
    if (t.includes("no responde") || t.includes("sin api") || t.startsWith("http 5")) {
        return "err";
    }
    if (t.startsWith("http 4") || t.includes("error")) {
        return "warn";
    }
    if (t.includes("ok") || t.includes("healthy") || t.includes("connected")) {
        return "ok";
    }
    return "neutral";
}

export function rpcToneFromText(text: string): ConsolaStatusTone {
    const t = text.toLowerCase();
    if (t === "—" || t.includes("…")) {
        return "loading";
    }
    if (t.includes("no responde") || t.startsWith("http 5")) {
        return "err";
    }
    if (t.startsWith("http 4")) {
        return "warn";
    }
    if (t.includes("ok") || t.includes("healthy")) {
        return "ok";
    }
    return "neutral";
}
