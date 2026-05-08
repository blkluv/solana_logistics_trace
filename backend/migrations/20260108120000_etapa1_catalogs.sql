-- Etapa 1 — Catálogos §3 + seeds idempotentes (PLAN_IMPLEMENTACION_DETALLADO §6.0)

CREATE TABLE cat_actor_role (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cat_shipment_status (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cat_checkpoint_type (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cat_incident_type (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seeds §3 (ON CONFLICT idempotente)
INSERT INTO cat_actor_role (code, label, description, sort_order)
VALUES
    ('Sender', 'Sender', NULL, 10),
    ('Carrier', 'Carrier', NULL, 20),
    ('Hub', 'Hub', NULL, 30),
    ('Recipient', 'Recipient', NULL, 40),
    ('Inspector', 'Inspector', NULL, 50)
ON CONFLICT (code) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

INSERT INTO cat_shipment_status (code, label, description, sort_order)
VALUES
    ('Created', 'Created', NULL, 10),
    ('InTransit', 'In transit', NULL, 20),
    ('AtHub', 'At hub', NULL, 30),
    ('OutForDelivery', 'Out for delivery', NULL, 40),
    ('Delivered', 'Delivered', NULL, 50),
    ('Returned', 'Returned', NULL, 60),
    ('Cancelled', 'Cancelled', NULL, 70)
ON CONFLICT (code) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

INSERT INTO cat_checkpoint_type (code, label, description, sort_order)
VALUES
    ('Pickup', 'Pickup', NULL, 10),
    ('HubIn', 'Hub inbound', NULL, 20),
    ('HubOut', 'Hub outbound', NULL, 30),
    ('Transit', 'Transit', NULL, 40),
    ('DeliveryAttempt', 'Delivery attempt', NULL, 50),
    ('Delivered', 'Delivered', NULL, 60),
    ('SensorData', 'Sensor data', NULL, 70)
ON CONFLICT (code) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

INSERT INTO cat_incident_type (code, label, description, sort_order)
VALUES
    ('Delay', 'Delay', NULL, 10),
    ('Damage', 'Damage', NULL, 20),
    ('Lost', 'Lost', NULL, 30),
    ('TempViolation', 'Temperature violation', NULL, 40),
    ('Unauthorized', 'Unauthorized', NULL, 50)
ON CONFLICT (code) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;
