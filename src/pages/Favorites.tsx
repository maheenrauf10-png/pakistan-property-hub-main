import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import Layout from '@/components/layout/Layout';
import PropertyCard from '@/components/property/PropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const { favoriteIds, toggleFavorite, isFavorited } = useFavorites();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['favorite-properties', Array.from(favoriteIds)],
    queryFn: async () => {
      if (favoriteIds.size === 0) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', Array.from(favoriteIds))
        .eq('status', 'active');

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
    enabled: favoriteIds.size > 0,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">My Favorites</h1>
          <p className="text-muted-foreground mt-2">
            Properties you've saved for later
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : !properties || properties.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring properties and save your favorites here
            </p>
            <Link to="/properties">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                showFavorite
                isFavorited={isFavorited(property.id)}
                onFavoriteClick={() => toggleFavorite(property.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
