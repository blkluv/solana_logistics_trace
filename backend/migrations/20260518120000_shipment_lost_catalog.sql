-- Tipo de incidencia de pérdida para motor y reportes on-chain.

INSERT INTO cat_incident_type (code, label, description, sort_order)
VALUES ('SHIPMENT_LOST', 'Pérdida de envío', 'Envío declarado como perdido', 75)
ON CONFLICT (code) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;
