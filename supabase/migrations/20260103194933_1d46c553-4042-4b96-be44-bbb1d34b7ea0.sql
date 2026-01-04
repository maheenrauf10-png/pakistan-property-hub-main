-- Create spots table for points of interest
CREATE TABLE public.spots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('education', 'healthcare', 'transport', 'retail')),
  subcategory TEXT,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;

-- Anyone can view spots (public data)
CREATE POLICY "Anyone can view spots"
  ON public.spots
  FOR SELECT
  USING (true);

-- Create index for faster city/area lookups
CREATE INDEX idx_spots_city_area ON public.spots (city, area);
CREATE INDEX idx_spots_category ON public.spots (category);