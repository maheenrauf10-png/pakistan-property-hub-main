-- Add verified field to properties table
ALTER TABLE public.properties 
ADD COLUMN verified boolean NOT NULL DEFAULT false;