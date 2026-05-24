-- Matriz MVP de severidad por regla (fuente de verdad para el motor).

UPDATE incident_rules SET severity = 'Critical' WHERE rule_name = 'cold_chain_limit';
UPDATE incident_rules SET severity = 'High' WHERE rule_name = 'humidity_limit';
UPDATE incident_rules SET severity = 'High' WHERE rule_name = 'shipment_delay';
UPDATE incident_rules SET severity = 'High' WHERE rule_name = 'route_deviation';
UPDATE incident_rules SET severity = 'Medium' WHERE rule_name = 'sensor_offline';

COMMENT ON TABLE incident_rules IS
    'Reglas del motor: incident_type, severity (Critical|High|Medium|Low) y umbrales JSON.';
