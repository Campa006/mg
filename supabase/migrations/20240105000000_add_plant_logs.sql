-- Create plant_logs table for AI diagnosis and manual entries
CREATE TABLE public.plant_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
    image_url TEXT,
    diagnosis TEXT,
    probability NUMERIC,
    suggested_action TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.plant_logs ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Users can only view their own plant logs
CREATE POLICY "Users can view their own plant logs" 
ON public.plant_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_logs.plant_id 
    AND plants.user_id = auth.uid()
  )
);

-- Users can only insert their own plant logs
CREATE POLICY "Users can insert their own plant logs" 
ON public.plant_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = plant_logs.plant_id 
    AND plants.user_id = auth.uid()
  )
);

-- Setup Storage Bucket for plant images
INSERT INTO storage.buckets (id, name, public) VALUES ('plant_images', 'plant_images', true) ON CONFLICT DO NOTHING;

-- Storage Policies
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'plant_images' );

CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'plant_images' );
