-- Estructura inicial de campañas comerciales.
-- Los canales y formularios se asociarán en migraciones posteriores.

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Rechazamos nombres vacíos o compuestos solamente por espacios.
  name TEXT NOT NULL
    CHECK (length(btrim(name)) > 0),

  -- Describe qué busca conseguir la campaña inmobiliaria.
  objective TEXT NOT NULL
    CHECK (length(btrim(objective)) > 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);