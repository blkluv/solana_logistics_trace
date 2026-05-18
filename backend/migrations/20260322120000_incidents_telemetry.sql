-- Etapa 3 — Incidencias y telemetría (off-chain; shipment_id = UUID de servicio).

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments (id) ON DELETE CASCADE,
    incident_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    source TEXT NOT NULL CHECK (source IN ('auto', 'on_chain', 'manual_offchain')),
    description TEXT NOT NULL DEFAULT '',
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ NULL,
    evidence_json JSONB NULL,
    evidence_hash TEXT NULL,
    rule_name TEXT NULL,
    created_by_wallet TEXT NULL,
    tx_hash TEXT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_shipment ON incidents (shipment_id, detected_at DESC);
CREATE INDEX idx_incidents_status ON incidents (status) WHERE status = 'Open';

CREATE TABLE telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments (id) ON DELETE CASCADE,
    telemetry_type TEXT NOT NULL,
    value_numeric DOUBLE PRECISION NULL,
    latitude DOUBLE PRECISION NULL,
    longitude DOUBLE PRECISION NULL,
    metadata_json JSONB NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_telemetry_shipment_recorded ON telemetry_events (shipment_id, recorded_at DESC);
