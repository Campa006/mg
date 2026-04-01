-- Create plants table
CREATE TABLE public.plants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    genetica TEXT,
    fase_actual TEXT,
    trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Users can only read their own plants
CREATE POLICY "Users can view their own plants" 
ON public.plants 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert their own plants
CREATE POLICY "Users can insert their own plants" 
ON public.plants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own plants
CREATE POLICY "Users can update their own plants" 
ON public.plants 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own plants
CREATE POLICY "Users can delete their own plants" 
ON public.plants 
FOR DELETE 
USING (auth.uid() = user_id);
