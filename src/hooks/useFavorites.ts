import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's favorites
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setIsLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
      } else {
        setFavoriteIds(new Set(data.map(f => f.property_id)));
      }
      setIsLoading(false);
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    const isFavorited = favoriteIds.has(propertyId);

    if (isFavorited) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) {
        toast.error('Failed to remove from favorites');
        console.error(error);
      } else {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
        toast.success('Removed from favorites');
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, property_id: propertyId });

      if (error) {
        toast.error('Failed to add to favorites');
        console.error(error);
      } else {
        setFavoriteIds(prev => new Set(prev).add(propertyId));
        toast.success('Added to favorites');
      }
    }
  }, [user, favoriteIds]);

  const isFavorited = useCallback((propertyId: string) => {
    return favoriteIds.has(propertyId);
  }, [favoriteIds]);

  return { favoriteIds, isLoading, toggleFavorite, isFavorited };
};
