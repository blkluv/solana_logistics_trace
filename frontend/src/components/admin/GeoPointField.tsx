"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

import {
    formatGeoPoint,
    parseGeoPoint,
    type GeoPoint,
} from "@/lib/geo/geoPoint";

const MapPointPickerLazy = dynamic(
    () => import("@/components/admin/MapPointPicker").then((m) => ({ default: m.MapPointPicker })),
    {
        ssr: false,
        loading: () => (
            <p className="text-sm text-muted mb-0" role="status">
                Cargando mapa…
            </p>
        ),
    },
);

export type LocationInputMode = "text" | "coordinates";

export type GeoPointFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    mode?: LocationInputMode;
    onModeChange?: (mode: LocationInputMode) => void;
};

export function GeoPointField({
    id,
    label,
    value,
    onChange,
    disabled,
    mode: modeProp,
    onModeChange,
}: GeoPointFieldProps) {
    const [modeInternal, setModeInternal] = useState<LocationInputMode>(() =>
        parseGeoPoint(value) ? "coordinates" : "text",
    );
    const mode = modeProp ?? modeInternal;

    const point = useMemo(() => parseGeoPoint(value), [value]);

    const handleModeChange = useCallback(
        (next: LocationInputMode) => {
            if (modeProp === undefined) {
                setModeInternal(next);
            }
            onModeChange?.(next);
            if (next === "coordinates" && !parseGeoPoint(value)) {
                onChange("");
            }
        },
        [modeProp, onModeChange, value, onChange],
    );

    const onMapPick = useCallback(
        (p: GeoPoint) => {
            onChange(formatGeoPoint(p));
        },
        [onChange],
    );

    return (
        <fieldset className="geo-point-field" disabled={disabled}>
            <legend className="geo-point-field__legend">{label}</legend>
            <div className="segmented geo-point-field__mode" role="group" aria-label={`Modo ${label}`}>
                <button
                    type="button"
                    className={mode === "text" ? "is-active" : ""}
                    onClick={() => handleModeChange("text")}
                >
                    Descripción
                </button>
                <button
                    type="button"
                    className={mode === "coordinates" ? "is-active" : ""}
                    onClick={() => handleModeChange("coordinates")}
                >
                    Coordenadas (mapa)
                </button>
            </div>
            {mode === "text" ? (
                <div className="form-group mb-0">
                    <label htmlFor={id} className="sr-only">
                        {label}
                    </label>
                    <input
                        id={id}
                        className="input"
                        value={value}
                        placeholder="Ej. Almacén Lisboa, Hub Sur"
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            ) : (
                <div className="geo-point-field__map">
                    <MapPointPickerLazy
                        value={point}
                        onChange={onMapPick}
                        ariaLabel={`Mapa: ${label}`}
                    />
                    <div className="form-group mt-2 mb-0">
                        <label htmlFor={id} className="text-xs text-muted">
                            Coordenadas (editable)
                        </label>
                        <input
                            id={id}
                            className="input mono text-sm"
                            value={value}
                            placeholder="40.416800,-3.703800"
                            onChange={(e) => onChange(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </fieldset>
    );
}
