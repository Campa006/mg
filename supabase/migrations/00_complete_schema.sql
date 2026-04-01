-- 1. Create plants table
CREATE TABLE IF NOT EXISTS public.plants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    genetica TEXT,
    fase_actual TEXT,
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    ciclo_total_estimado INTEGER NOT NULL DEFAULT 80,
    trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (Drop them first if they exist to avoid errors)
DROP POLICY IF EXISTS "Users can view their own plants" ON public.plants;
CREATE POLICY "Users can view their own plants" 
ON public.plants 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own plants" ON public.plants;
CREATE POLICY "Users can insert their own plants" 
ON public.plants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own plants" ON public.plants;
CREATE POLICY "Users can update their own plants" 
ON public.plants 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own plants" ON public.plants;
CREATE POLICY "Users can delete their own plants" 
ON public.plants 
FOR DELETE 
USING (auth.uid() = user_id);
