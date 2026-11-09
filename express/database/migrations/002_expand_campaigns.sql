-- Ampliamos la tabla existente sin borrar ni renombrar registros.
ALTER TABLE campaigns
  ADD COLUMN status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN start_date TIMESTAMPTZ,
  ADD COLUMN end_date TIMESTAMPTZ,
  ADD COLUMN updated_at TIMESTAMPTZ,

  ADD CONSTRAINT campaigns_status_valid
    CHECK (
      status IN ('draft', 'active', 'paused', 'completed')
    ),

  ADD CONSTRAINT campaigns_period_valid
    CHECK (
      start_date IS NULL
      OR end_date IS NULL
      OR end_date > start_date
    );

-- Para los registros anteriores, conservamos su fecha de creación.
UPDATE campaigns
SET updated_at = created_at;

ALTER TABLE campaigns
  ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN updated_at SET NOT NULL;

-- El DEFAULT inicializa updated_at al insertar.
-- Cuando implementemos edición, el repositorio deberá actualizarla.