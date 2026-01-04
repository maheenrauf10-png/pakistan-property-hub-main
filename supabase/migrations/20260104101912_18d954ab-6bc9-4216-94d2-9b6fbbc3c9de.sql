-- Drop the current policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create restrictive policy: users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a SECURITY DEFINER function to get owner phones for properties
-- This allows the app to fetch owner phones without exposing the full profiles table
CREATE OR REPLACE FUNCTION public.get_property_owner_phones(property_user_ids uuid[])
RETURNS TABLE(user_id uuid, phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.phone
  FROM public.profiles p
  WHERE p.user_id = ANY(property_user_ids);
$$;