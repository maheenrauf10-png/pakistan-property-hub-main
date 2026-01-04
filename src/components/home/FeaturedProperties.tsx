import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PropertyCard from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedProperties = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      
      // Fetch owner phones using secure RPC function
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(p => p.user_id))];
        const { data: phones } = await supabase
          .rpc('get_property_owner_phones', { property_user_ids: userIds });
        
        const phoneMap = new Map(phones?.map((p: { user_id: string; phone: string | null }) => [p.user_id, p.phone]) || []);
        return data.map(p => ({
          ...p,
          owner_phone: phoneMap.get(p.user_id) || null
        }));
      }
      
      return data;
    },
  });

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-heading font-bold text-foreground">Featured Properties</h2>
            <p className="mt-2 text-muted-foreground">Handpicked properties for you</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/properties">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured properties available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
