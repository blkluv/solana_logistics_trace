import type { ReactNode } from "react";

import type { CheckpointIconKind } from "@/lib/shipments/checkpointDisplay";
import type { JourneyStepIconKind } from "@/lib/shipments/journeyTimeline";

type IconProps = { className?: string };

function Svg({ className, children }: { className?: string; children: ReactNode }) {
    return (
        <svg
            className={className ?? "trace-icon"}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            {children}
        </svg>
    );
}

export function IconPackage({ className }: IconProps) {
    return (
        <Svg className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </Svg>
    );
}

export function IconTruck({ className }: IconProps) {
    return (
        <Svg className={className}>
            <path d="M10 17h4" />
            <path d="M3 17h2" />
            <path d="M19 17h2" />
            <path d="M5 17H3l2-9h9l2 4h4l1 5h-2" />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
        </Svg>
    );
}

export function IconMapPin({ className }: IconProps) {
    return (
        <Svg className={className}>
            <path d="M12 21s6-4.35 6-10a6 6 0 1 0-12 0c0 5.65 6 10 6 10z" />
            <circle cx="12" cy="11" r="2" />
        </Svg>
    );
}

export function IconThermometer({ className }: IconProps) {
    return (
        <Svg className={className}>
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </Svg>
    );
}

export function IconAlert({ className }: IconProps) {
    return (
        <Svg className={className}>
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </Svg>
    );
}

export function IconCheckCircle({ className }: IconProps) {
    return (
        <Svg className={className}>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </Svg>
    );
}

export function IconRadio({ className }: IconProps) {
    return (
        <Svg className={className}>
            <circle cx="12" cy="12" r="2" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
            <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
        </Svg>
    );
}

export function IconLink({ className }: IconProps) {
    return (
        <Svg className={className}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </Svg>
    );
}

export function IconHub({ className }: IconProps) {
    return (
        <Svg className={className}>
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 21v-6h6v6" />
        </Svg>
    );
}

export function IconBox({ className }: IconProps) {
    return (
        <Svg className={className}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <path d="M3.27 6.96 12 12.01l8.73-5.05" />
            <path d="M12 22.08V12" />
        </Svg>
    );
}

export function IconUser({ className }: IconProps) {
    return (
        <Svg className={className}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
        </Svg>
    );
}

export function CheckpointTypeIcon({
    kind,
    className,
}: {
    kind: CheckpointIconKind;
    className?: string;
}) {
    switch (kind) {
        case "pickup":
            return <IconPackage className={className} />;
        case "hub":
            return <IconMapPin className={className} />;
        case "transit":
            return <IconTruck className={className} />;
        case "delivery":
            return <IconCheckCircle className={className} />;
        case "sensor":
            return <IconRadio className={className} />;
        default:
            return <IconMapPin className={className} />;
    }
}

export function JourneyStepIcon({
    kind,
    className,
}: {
    kind: JourneyStepIconKind;
    className?: string;
}) {
    switch (kind) {
        case "created":
            return <IconBox className={className} />;
        case "pickup":
            return <IconPackage className={className} />;
        case "hub":
            return <IconHub className={className} />;
        case "transit":
            return <IconTruck className={className} />;
        case "out":
            return <IconMapPin className={className} />;
        case "delivered":
            return <IconCheckCircle className={className} />;
        default:
            return <IconMapPin className={className} />;
    }
}

export function IncidentTypeIcon({ type, className }: { type: string; className?: string }) {
    if (type.includes("COLD") || type.includes("Temp")) {
        return <IconThermometer className={className} />;
    }
    if (type.includes("ROUTE") || type.includes("Delay")) {
        return <IconTruck className={className} />;
    }
    if (type.includes("HUMIDITY") || type.includes("SENSOR")) {
        return <IconRadio className={className} />;
    }
    return <IconAlert className={className} />;
}
