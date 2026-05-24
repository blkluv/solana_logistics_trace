-- Carrier assignment (on-chain `Shipment.carrier` synced via assign_carrier tx).
ALTER TABLE shipments
    ADD COLUMN IF NOT EXISTS carrier_wallet TEXT;

CREATE INDEX IF NOT EXISTS idx_shipments_carrier_wallet
    ON shipments (carrier_wallet)
    WHERE carrier_wallet IS NOT NULL;
