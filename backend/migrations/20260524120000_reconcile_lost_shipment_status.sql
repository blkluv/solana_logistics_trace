-- Envíos con incidencia de pérdida deben reflejar estado Lost en operaciones.

INSERT INTO cat_shipment_status (code, label, description, sort_order)
VALUES ('Lost', 'Pérdida', 'Envío declarado como perdido', 80)
ON CONFLICT (code) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order;

UPDATE shipments s
SET status = 'Lost'
WHERE s.status NOT IN ('Lost', 'Cancelled', 'Delivered')
  AND EXISTS (
      SELECT 1
      FROM incidents i
      WHERE i.shipment_id = s.id
        AND i.incident_type IN ('Lost', 'SHIPMENT_LOST')
  );
