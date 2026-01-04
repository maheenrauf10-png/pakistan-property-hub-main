-- Fix the RPC function to add proper access control
-- Only return phones for users who actually own active properties
CREATE OR REPLACE FUNCTION public.get_property_owner_phones(property_user_ids uuid[])
RETURNS TABLE(user_id uuid, phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.user_id, p.phone
  FROM public.profiles p
  INNER JOIN public.properties prop ON prop.user_id = p.user_id
  WHERE p.user_id = ANY(property_user_ids)
    AND prop.status = 'active'
    AND array_length(property_user_ids, 1) <= 100;
$$;