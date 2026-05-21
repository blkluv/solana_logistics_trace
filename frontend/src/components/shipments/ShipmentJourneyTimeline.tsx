"use client";

import type { CheckpointItem } from "@/lib/api/shipments";
import {
    exceptionStatusLabel,
    parseCoordEndpoint,
    resolveJourneyStepStates,
} from "@/lib/shipments/journeyTimeline";
import { statusLabel } from "@/lib/shipments/display";

export type ShipmentJourneyTimelineProps = {
    origin: string;
    destination: string;
    status: string;
    checkpoints: CheckpointItem[];
};

export function ShipmentJourneyTimeline({
    origin,
    destination,
    status,
    checkpoints,
}: ShipmentJourneyTimelineProps) {
    const from = parseCoordEndpoint(origin);
    const to = parseCoordEndpoint(destination);
    const logisticsTypes = checkpoints
        .filter((c) => c.type !== "SensorData" && !c.actor.startsWith("system@"))
        .map((c) => c.type);
    const steps = resolveJourneyStepStates(status, logisticsTypes);
    const exception = exceptionStatusLabel(status);

    return (
        <section className="shipment-journey" aria-label="Recorrido y etapas del envío">
            <div className="shipment-journey__corridor">
                <div className="shipment-journey__endpoint">
                    <span className="shipment-journey__endpoint-tag">Origen</span>
                    <span className="shipment-journey__endpoint-coords mono">{from.label}</span>
                </div>
                <div className="shipment-journey__corridor-line" aria-hidden>
                    <span className="shipment-journey__corridor-track" />
                </div>
                <div className="shipment-journey__endpoint shipment-journey__endpoint--dest">
                    <span className="shipment-journey__endpoint-tag">Destino</span>
                    <span className="shipment-journey__endpoint-coords mono">{to.label}</span>
                </div>
            </div>

            <div className="shipment-journey__rail-wrap">
                <p className="shipment-journey__rail-caption">
                    Ciclo logístico
                    <span className="shipment-journey__rail-status">
                        · {statusLabel(status)}
                    </span>
                </p>
                <div className="shipment-journey__rail" data-testid="shipment-journey-timeline">
                    <div className="shipment-journey__rail-spine" aria-hidden />
                    <ol className="shipment-journey__steps">
                        {steps.map(({ step, state, eventRecorded }) => {
                            const cls = [
                                "shipment-journey__step",
                                state === "current" && "is-current",
                                state === "past" && "is-past",
                                state === "future" && "is-future",
                                state === "offpath" && "is-muted",
                            ]
                                .filter(Boolean)
                                .join(" ");
                            return (
                                <li key={step.id} className={cls}>
                                    <span className="shipment-journey__marker" aria-hidden>
                                        <span className="shipment-journey__dot" />
                                        {eventRecorded && state !== "future" ? (
                                            <span className="shipment-journey__check" aria-hidden>
                                                ✓
                                            </span>
                                        ) : null}
                                    </span>
                                    <span className="shipment-journey__label">{step.label}</span>
                                    {state === "current" ? (
                                        <span className="shipment-journey__here">Ahora</span>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ol>
                </div>
                {exception ? (
                    <p className="shipment-journey__exception" role="status">
                        <span className="badge badge--danger">{exception}</span>
                    </p>
                ) : null}
            </div>
        </section>
    );
}
