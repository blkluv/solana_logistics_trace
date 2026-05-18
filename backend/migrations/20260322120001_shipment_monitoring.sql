-- Monitoreo activo por envío (inicia al sincronizar creación).

ALTER TABLE shipments
    ADD COLUMN IF NOT EXISTS last_checkpoint_at TIMESTAMPTZ NULL;

CREATE TABLE shipment_monitoring (
    shipment_id UUID PRIMARY KEY REFERENCES shipments (id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'stopped')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    stopped_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_shipment_monitoring_active ON shipment_monitoring (status)
    WHERE status = 'active';
