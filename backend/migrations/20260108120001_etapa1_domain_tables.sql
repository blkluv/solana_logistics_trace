-- Etapa 1 — Dominio actors / shipments / checkpoints (§6)
-- gen_random_uuid() está disponible en PostgreSQL 13+ (imagen Docker 16).

CREATE TABLE actors (
    wallet TEXT PRIMARY KEY,
    role TEXT NOT NULL REFERENCES cat_actor_role (code) ON DELETE RESTRICT ON UPDATE RESTRICT,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    location TEXT NULL,
    shipments_created INTEGER NOT NULL DEFAULT 0,
    checkpoints_recorded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    registration_tx_hash TEXT UNIQUE
);

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    on_chain_shipment_id BIGINT NOT NULL UNIQUE,
    sender_wallet TEXT NOT NULL,
    recipient_wallet TEXT NOT NULL,
    product VARCHAR(64) NOT NULL DEFAULT '',
    origin VARCHAR(128) NOT NULL DEFAULT '',
    destination VARCHAR(128) NOT NULL DEFAULT '',
    status TEXT NOT NULL REFERENCES cat_shipment_status (code)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    requires_cold_chain BOOLEAN NOT NULL DEFAULT false,
    checkpoint_count INTEGER NOT NULL DEFAULT 0,
    incident_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    delivered_at TIMESTAMPTZ NULL,
    creation_tx_hash TEXT UNIQUE NOT NULL
);

CREATE INDEX idx_shipments_sender ON shipments (sender_wallet);

CREATE INDEX idx_shipments_recipient ON shipments (recipient_wallet);

CREATE TABLE checkpoints (
    id BIGSERIAL PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES shipments (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    on_chain_checkpoint_id BIGINT NOT NULL,
    actor_wallet TEXT NOT NULL,
    checkpoint_type TEXT NOT NULL REFERENCES cat_checkpoint_type (code)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    location VARCHAR(256) NULL,
    latitude DOUBLE PRECISION NULL,
    longitude DOUBLE PRECISION NULL,
    temperature_centi SMALLINT NULL,
    humidity SMALLINT NULL CHECK (
        humidity IS NULL
        OR (humidity >= 0 AND humidity <= 100)
    ),
    metadata_json JSONB NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    tx_hash TEXT NOT NULL UNIQUE,
    slot BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (shipment_id, on_chain_checkpoint_id)
);

CREATE INDEX idx_checkpoints_shipment_occurred ON checkpoints (shipment_id, occurred_at ASC);

CREATE INDEX idx_checkpoints_actor ON checkpoints (actor_wallet);
