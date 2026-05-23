"use client";

import type { ReactNode } from "react";

import type { JourneyStepInsight } from "@/lib/shipments/journeyTimeline";

export type JourneyStepTooltipProps = {
    id: string;
    insight: JourneyStepInsight;
    children: ReactNode;
};

export function JourneyStepTooltip({ id, insight, children }: JourneyStepTooltipProps) {
    const tooltipId = `journey-tip-${id}`;
    return (
        <span className="shipment-journey__tip-host">
            <span className="shipment-journey__tip-trigger" aria-describedby={tooltipId} tabIndex={0}>
                {children}
            </span>
            <span className="shipment-journey__tooltip" id={tooltipId} role="tooltip">
                {insight.lines.map((line, i) => (
                    <span key={`${id}-${i}`} className="shipment-journey__tooltip-line">
                        {line}
                    </span>
                ))}
            </span>
        </span>
    );
}
