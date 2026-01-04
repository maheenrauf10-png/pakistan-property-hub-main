-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_property_owner_phones(uuid[]);

-- Recreate with full_name included
CREATE OR REPLACE FUNCTION public.get_property_owner_phones(property_user_ids uuid[])
RETURNS TABLE(user_id uuid, phone text, full_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT p.user_id, p.phone, p.full_name
  FROM public.profiles p
  INNER JOIN public.properties prop ON prop.user_id = p.user_id
  WHERE p.user_id = ANY(property_user_ids)
    AND prop.status = 'active'
    AND array_length(property_user_ids, 1) <= 100;
$$;