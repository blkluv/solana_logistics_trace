import { IconUser } from "@/components/ui/TraceIcons";
import type { WalletParticipant } from "@/lib/api/shipments";
import { formatParticipantLine, formatParticipantSub } from "@/lib/wallet/display";

export type ShipmentParticipantChipProps = {
    label: string;
    participant: WalletParticipant;
};

export function ShipmentParticipantChip({ label, participant }: ShipmentParticipantChipProps) {
    return (
        <div className="shipment-participant">
            <span className="shipment-participant__icon" aria-hidden>
                <IconUser />
            </span>
            <div className="shipment-participant__body">
                <span className="shipment-participant__label text-muted">{label}</span>
                <span className="shipment-participant__name">{formatParticipantLine(participant)}</span>
                <span className="shipment-participant__wallet mono">{formatParticipantSub(participant)}</span>
            </div>
        </div>
    );
}
