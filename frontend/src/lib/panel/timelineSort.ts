import type { CheckpointItem } from "@/lib/api/shipments";

/** Orden estable por `occurredAt` ISO (backend ya ordena; refuerzo en cliente). */
export function sortCheckpointsByOccurredAt(items: CheckpointItem[]): CheckpointItem[] {
    return [...items].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}
