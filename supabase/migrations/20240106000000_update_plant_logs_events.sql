-- Modificar tabla plant_logs para soportar eventos manuales y de voz
ALTER TABLE public.plant_logs
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'Doctor AI', -- ej: 'Doctor AI', 'Riego', 'Fertilizante', 'Poda', 'Observación'
ADD COLUMN IF NOT EXISTS amount TEXT, -- ej: '2L', '5ml/L'
ADD COLUMN IF NOT EXISTS is_synced BOOLEAN DEFAULT true; -- Para manejo offline

-- Indice para búsquedas rápidas por tipo de evento
CREATE INDEX IF NOT EXISTS idx_plant_logs_event_type ON public.plant_logs(event_type);
