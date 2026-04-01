-- Añadir nuevas columnas a la tabla plants para el Cerebro Cronos
ALTER TABLE public.plants
ADD COLUMN IF NOT EXISTS fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS ciclo_total_estimado INTEGER NOT NULL DEFAULT 80;
