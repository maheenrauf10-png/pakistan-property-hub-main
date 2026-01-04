import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFavorites } from '@/hooks/useFavorites';
import Layout from '@/components/layout/Layout';
import PropertyCard from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, X } from 'lucide-react';
import { CITIES, LISTING_TYPES, PROPERTY_TYPES, formatPrice } from '@/lib/constants';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const { toggleFavorite, isFavorited } = useFavorites();

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedListingType, setSelectedListingType] = useState(searchParams.get('listing_type') || '');
  const [selectedPropertyType, setSelectedPropertyType] = useState(searchParams.get('property_type') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000000]);

  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ['properties', searchQuery, selectedCity, selectedListingType, selectedPropertyType, priceRange],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,area.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
      }
      if (selectedCity) {
        query = query.eq('city', selectedCity);
      }
      if (selectedListingType) {
        query = query.eq('listing_type', selectedListingType);
      }
      if (selectedPropertyType) {
        query = query.eq('property_type', selectedPropertyType);
      }
      if (priceRange[0] > 0) {
        query = query.gte('price', priceRange[0]);
      }
      if (priceRange[1] < 500000000) {
        query = query.lte('price', priceRange[1]);
      }

      const { data, error } = await query;
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

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedListingType) params.set('listing_type', selectedListingType);
    if (selectedPropertyType) params.set('property_type', selectedPropertyType);
    setSearchParams(params);
    refetch();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedListingType('');
    setSelectedPropertyType('');
    setPriceRange([0, 500000000]);
    setSearchParams({});
  };

  useEffect(() => {
    setSelectedCity(searchParams.get('city') || '');
    setSelectedListingType(searchParams.get('listing_type') || '');
    setSelectedPropertyType(searchParams.get('property_type') || '');
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const getPageTitle = () => {
    if (selectedListingType === 'rent') return 'Properties for Rent';
    if (selectedListingType === 'sale') return 'Properties for Sale';
    if (selectedListingType === 'land') return 'Land & Plots';
    if (selectedCity) return `Properties in ${selectedCity}`;
    return 'All Properties';
  };

  return (
    <Layout>
      <div className="bg-muted py-8">
        <div className="container">
          <h1 className="text-3xl font-heading font-bold text-foreground">{getPageTitle()}</h1>
          <p className="mt-2 text-muted-foreground">
            {properties?.length || 0} properties found
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by location, property name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={applyFilters}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-card rounded-lg p-6 shadow-card border border-border/50 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Select value={selectedCity || "all"} onValueChange={(val) => setSelectedCity(val === "all" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Listing Type</label>
                <Select value={selectedListingType || "all"} onValueChange={(val) => setSelectedListingType(val === "all" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {LISTING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Property Type</label>
                <Select value={selectedPropertyType || "all"} onValueChange={(val) => setSelectedPropertyType(val === "all" ? "" : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Price Range</label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  max={500000000}
                  step={1000000}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>PKR {formatPrice(priceRange[0])}</span>
                  <span>PKR {formatPrice(priceRange[1])}</span>
                </div>
              </div>

              <Button onClick={applyFilters} className="w-full">
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Properties Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
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
                  <PropertyCard
                    key={property.id}
                    property={property}
                    showFavorite
                    isFavorited={isFavorited(property.id)}
                    onFavoriteClick={() => toggleFavorite(property.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">No properties found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Properties;
