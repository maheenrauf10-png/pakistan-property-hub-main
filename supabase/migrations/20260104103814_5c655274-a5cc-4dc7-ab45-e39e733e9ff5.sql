-- Create a function to check inquiry rate limit (max 10 inquiries per hour per user/IP)
CREATE OR REPLACE FUNCTION public.check_inquiry_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  -- Count inquiries from this user in the last hour
  SELECT COUNT(*)
  INTO recent_count
  FROM public.inquiries
  WHERE (
    (auth.uid() IS NOT NULL AND sender_id = auth.uid())
    OR (auth.uid() IS NULL AND sender_email = current_setting('request.headers', true)::json->>'x-forwarded-for')
  )
  AND created_at > now() - interval '1 hour';
  
  -- Allow max 10 inquiries per hour
  RETURN recent_count < 10;
END;
$$;

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;

-- Create new INSERT policy with rate limiting
CREATE POLICY "Rate limited inquiry creation"
ON public.inquiries
FOR INSERT
WITH CHECK (
  public.check_inquiry_rate_limit()
);

-- Update SELECT policy to be more explicit about authenticated access
DROP POLICY IF EXISTS "Users can view inquiries they sent or received" ON public.inquiries;

CREATE POLICY "Authenticated users can view own inquiries"
ON public.inquiries
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (auth.uid() = sender_id OR auth.uid() = owner_id)
);