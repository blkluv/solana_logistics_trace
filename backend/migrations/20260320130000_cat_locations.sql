-- Catálogo de ubicaciones logísticas en El Salvador (origen/destino, solo lectura).

CREATE TABLE cat_location (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    facility_type TEXT NOT NULL,
    facility_type_label TEXT NOT NULL DEFAULT '',
    department TEXT NOT NULL DEFAULT '',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT cat_location_latitude_range CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT cat_location_longitude_range CHECK (longitude >= -180 AND longitude <= 180)
);

INSERT INTO cat_location (
    code,
    label,
    description,
    facility_type,
    facility_type_label,
    department,
    latitude,
    longitude,
    sort_order
)
VALUES
    (
        'sv_port_acajutla',
        'Puerto de Acajutla',
        'Principal puerto marítimo del Pacífico; carga contenerizada y granel.',
        'port',
        'Puerto marítimo',
        'La Unión',
        13.592200,
        -89.827500,
        10
    ),
    (
        'sv_port_la_union',
        'Puerto de La Unión (Cutuco)',
        'Terminal portuaria del Golfo de Fonseca; conexión regional Centroamérica.',
        'port',
        'Puerto marítimo',
        'La Unión',
        13.336400,
        -87.842800,
        20
    ),
    (
        'sv_airport_sal',
        'Aeropuerto Internacional El Salvador (SAL)',
        'Hub aéreo de carga y pasajeros; cadena fría aérea.',
        'airport',
        'Aeropuerto',
        'San Luis Talpa',
        13.440900,
        -89.055700,
        30
    ),
    (
        'sv_hub_san_bartolo',
        'Hub Zona Franca San Bartolo',
        'Centro de consolidación y despacho aduanero en área metropolitana.',
        'warehouse_hub',
        'Bodega / hub de distribución',
        'San Salvador',
        13.698600,
        -89.142200,
        40
    ),
    (
        'sv_wh_ilopango',
        'Bodega Central Ilopango',
        'Almacén de cross-docking y preparación de pedidos última milla.',
        'warehouse_hub',
        'Bodega / hub de distribución',
        'San Salvador',
        13.701400,
        -89.109400,
        50
    ),
    (
        'sv_dc_soyapango',
        'Centro de distribución Soyapango',
        'Nodo de distribución regional para el área este de San Salvador.',
        'distribution_center',
        'Centro de distribución',
        'San Salvador',
        13.712200,
        -89.139800,
        60
    ),
    (
        'sv_border_chinamas',
        'Aduana Las Chinamas',
        'Puesto fronterizo terrestre hacia Guatemala; carga consolidada.',
        'border_crossing',
        'Puesto aduanero',
        'Ahuachapán',
        13.975600,
        -89.676400,
        70
    ),
    (
        'sv_border_amatillo',
        'Aduana El Amatillo',
        'Frontera sur con Honduras; corredor logístico CA-4.',
        'border_crossing',
        'Puesto aduanero',
        'La Unión',
        13.565000,
        -87.962500,
        80
    ),
    (
        'sv_city_ss_centro',
        'San Salvador — Centro logístico',
        'Punto urbano de recolección y entrega en capital.',
        'city_hub',
        'Nodo urbano',
        'San Salvador',
        13.692900,
        -89.218200,
        90
    ),
    (
        'sv_hub_santa_ana',
        'Hub regional Santa Ana',
        'Bodega de tránsito para occidente del país.',
        'warehouse_hub',
        'Bodega / hub de distribución',
        'Santa Ana',
        13.994200,
        -89.559700,
        100
    ),
    (
        'sv_terminal_san_miguel',
        'Terminal de carga San Miguel',
        'Consolidación de exportación agrícola y manufactura del oriente.',
        'distribution_center',
        'Centro de distribución',
        'San Miguel',
        13.483300,
        -88.177800,
        110
    ),
    (
        'sv_port_la_libertad',
        'Muelle turístico La Libertad',
        'Embarque costero menor y abastecimiento pesquero refrigerado.',
        'port',
        'Puerto marítimo',
        'La Libertad',
        13.488300,
        -89.322200,
        120
    )
ON CONFLICT (code) DO UPDATE SET
    label = EXCLUDED.label,
    description = EXCLUDED.description,
    facility_type = EXCLUDED.facility_type,
    facility_type_label = EXCLUDED.facility_type_label,
    department = EXCLUDED.department,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active;
