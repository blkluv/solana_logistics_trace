-- Catálogo de productos para registro de envíos (solo lectura en Etapa 2).

CREATE TABLE cat_product (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    requires_cold_chain BOOLEAN NOT NULL DEFAULT false,
    packaging_type TEXT NOT NULL,
    packaging_label TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO cat_product (
    code,
    label,
    description,
    requires_cold_chain,
    packaging_type,
    packaging_label,
    category,
    sort_order
)
VALUES
    (
        'pharma_vaccines',
        'Vacunas biológicas',
        'Inmunobiológicos sensibles a temperatura; cadena de frío estricta 2–8 °C.',
        true,
        'cold_chain_box',
        'Caja isotérmica certificada (2–8 °C)',
        'Farmacéutico',
        10
    ),
    (
        'pharma_oncology',
        'Medicamentos oncológicos',
        'Fármacos de alto valor; control de temperatura y trazabilidad punto a punto.',
        true,
        'refrigerated_pallet',
        'Palet refrigerado con data logger',
        'Farmacéutico',
        20
    ),
    (
        'blood_products',
        'Hemoderivados',
        'Plasma y concentrados eritrocitarios; manipulación en frío.',
        true,
        'insulated_crate',
        'Contenedor térmico sellado',
        'Salud',
        30
    ),
    (
        'fresh_seafood',
        'Mariscos frescos',
        'Producto perecedero; ventilación y hielo gel según ruta.',
        true,
        'insulated_crate',
        'Caja térmica con gel packs',
        'Alimentos',
        40
    ),
    (
        'dairy_uht',
        'Lácteos UHT y derivados',
        'Leche y yogurt; refrigeración continua recomendada.',
        true,
        'cold_chain_box',
        'Caja refrigerada',
        'Alimentos',
        50
    ),
    (
        'fresh_flowers',
        'Flores tropicales frescas',
        'Flores de exportación; temperatura controlada y humedad relativa.',
        true,
        'ventilated_crate',
        'Caja ventilada con cartón húmedo',
        'Agroexportación',
        60
    ),
    (
        'agri_seeds',
        'Semillas certificadas',
        'Semillas tratadas para siembra; ambiente seco y protegido de humedad.',
        false,
        'standard_pallet',
        'Palet estándar filmado',
        'Agroindustria',
        70
    ),
    (
        'electronics_smd',
        'Componentes electrónicos SMD',
        'Circuitos y sensores; protección ESD y humedad.',
        false,
        'anti_static_box',
        'Caja antiestática con espuma',
        'Electrónica',
        80
    ),
    (
        'legal_documents',
        'Documentación legal sellada',
        'Contratos y expedientes; sin requisitos de frío.',
        false,
        'sealed_envelope',
        'Sobre/caja sellada anti manipulación',
        'Legal',
        90
    ),
    (
        'medical_devices',
        'Equipos médicos de diagnóstico',
        'Equipos portátiles; embalaje rígido y seguro para transporte.',
        false,
        'rugged_crate',
        'Caja rígida con amortiguación',
        'Salud',
        100
    )
ON CONFLICT (code) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    requires_cold_chain = EXCLUDED.requires_cold_chain,
    packaging_type = EXCLUDED.packaging_type,
    packaging_label = EXCLUDED.packaging_label,
    category = EXCLUDED.category,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;
