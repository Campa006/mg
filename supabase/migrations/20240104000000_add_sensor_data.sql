-- Create sensor_data table for VPD and biometrics tracking
CREATE TABLE public.sensor_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
    temperature NUMERIC NOT NULL,
    humidity NUMERIC NOT NULL,
    vpd NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Users can only view their own plant sensor data
CREATE POLICY "Users can view their own plant sensor data" 
ON public.sensor_data 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = sensor_data.plant_id 
    AND plants.user_id = auth.uid()
  )
);

-- Users can only insert their own plant sensor data
CREATE POLICY "Users can insert their own plant sensor data" 
ON public.sensor_data 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.plants 
    WHERE plants.id = sensor_data.plant_id 
    AND plants.user_id = auth.uid()
  )
);
