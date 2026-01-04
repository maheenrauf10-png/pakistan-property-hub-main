-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'plot', 'commercial', 'farmhouse')),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('rent', 'sale', 'land')),
  price BIGINT NOT NULL,
  price_unit TEXT DEFAULT 'total' CHECK (price_unit IN ('total', 'monthly', 'yearly', 'per_marla', 'per_kanal')),
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT,
  size_value DECIMAL(10,2) NOT NULL,
  size_unit TEXT NOT NULL CHECK (size_unit IN ('marla', 'kanal', 'sqft', 'sqyd')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  amenities TEXT[],
  images TEXT[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'rented', 'pending', 'inactive')),
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Properties policies - Anyone can view active properties
CREATE POLICY "Anyone can view active properties" ON public.properties FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON public.properties FOR DELETE USING (auth.uid() = user_id);

-- Create inquiries table
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('buy', 'rent', 'general')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on inquiries
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Inquiries policies
CREATE POLICY "Users can view inquiries they sent or received" ON public.inquiries 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = owner_id);
CREATE POLICY "Anyone can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Property owners can update inquiry status" ON public.inquiries FOR UPDATE USING (auth.uid() = owner_id);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
CREATE INDEX idx_inquiries_owner_id ON public.inquiries(owner_id);
CREATE INDEX idx_inquiries_sender_id ON public.inquiries(sender_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();