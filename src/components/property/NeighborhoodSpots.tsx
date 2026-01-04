import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Hospital, ShoppingBag, Train, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface NeighborhoodSpotsProps {
  city: string;
  area: string;
}

const categoryConfig = {
  education: {
    icon: GraduationCap,
    label: 'Education',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  healthcare: {
    icon: Hospital,
    label: 'Healthcare',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  retail: {
    icon: ShoppingBag,
    label: 'Retail & Markets',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  transport: {
    icon: Train,
    label: 'Transport',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
};

const NeighborhoodSpots = ({ city, area }: NeighborhoodSpotsProps) => {
  const { data: spots, isLoading } = useQuery({
    queryKey: ['neighborhood-spots', city, area],
    queryFn: async () => {
      // First try to get spots for the exact area
      const { data: areaSpots, error: areaError } = await supabase
        .from('spots')
        .select('*')
        .eq('city', city)
        .eq('area', area);

      if (areaError) throw areaError;

      // If no spots found for exact area, get city-wide spots
      if (areaSpots.length === 0) {
        const { data: citySpots, error: cityError } = await supabase
          .from('spots')
          .select('*')
          .eq('city', city)
          .limit(8);

        if (cityError) throw cityError;
        return citySpots;
      }

      return areaSpots;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (!spots || spots.length === 0) {
    return null;
  }

  // Group spots by category
  const groupedSpots = spots.reduce((acc, spot) => {
    const category = spot.category as keyof typeof categoryConfig;
    if (!acc[category]) acc[category] = [];
    acc[category].push(spot);
    return acc;
  }, {} as Record<string, typeof spots>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-heading font-semibold text-lg">Neighborhood & Nearby</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(groupedSpots).map(([category, categorySpots]) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          if (!config) return null;
          const Icon = config.icon;

          return (
            <div
              key={category}
              className={`rounded-lg border border-border p-4 ${config.bgColor}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-5 w-5 ${config.color}`} />
                <span className="font-medium text-sm">{config.label}</span>
              </div>
              <ul className="space-y-2">
                {categorySpots.slice(0, 3).map((spot) => (
                  <li key={spot.id} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-muted-foreground/50">•</span>
                    <span>{spot.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Based on property location in {area}, {city}
      </p>
    </div>
  );
};

export default NeighborhoodSpots;
