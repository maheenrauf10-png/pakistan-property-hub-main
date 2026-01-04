import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { School, Hospital, ShoppingBag, Train, Home, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Pakistan city coordinates
const CITY_COORDINATES: Record<string, [number, number]> = {
  'Karachi': [24.8607, 67.0011],
  'Lahore': [31.5204, 74.3587],
  'Islamabad': [33.6844, 73.0479],
  'Rawalpindi': [33.5651, 73.0169],
  'Faisalabad': [31.4504, 73.1350],
  'Multan': [30.1575, 71.5249],
  'Peshawar': [34.0151, 71.5249],
  'Quetta': [30.1798, 66.9750],
};

const CATEGORY_COLORS: Record<string, string> = {
  education: '#3b82f6',
  healthcare: '#ef4444',
  retail: '#f59e0b',
  transport: '#22c55e',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  education: School,
  healthcare: Hospital,
  retail: ShoppingBag,
  transport: Train,
};

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  area: string;
  property_type: string;
  listing_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
}

interface Spot {
  id: string;
  name: string;
  category: string;
  city: string;
  area: string;
  latitude: number | null;
  longitude: number | null;
}

interface PropertyMapProps {
  selectedCity?: string;
  showHeatZones?: boolean;
  heatZoneType?: 'price' | 'schools' | 'transport' | 'safety' | 'noise' | 'flood';
}

// Component to fit bounds when properties change
function FitBounds({ bounds }: { bounds: LatLngBounds | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
}

// Generate pseudo-coordinates for areas based on city center
function getAreaCoordinates(city: string, area: string): [number, number] {
  const cityCenter = CITY_COORDINATES[city] || [30.3753, 69.3451];
  // Create deterministic offset based on area name
  const hash = area.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 100) - 50) * 0.005;
  const lngOffset = ((hash % 73) - 36) * 0.005;
  return [cityCenter[0] + latOffset, cityCenter[1] + lngOffset];
}

// Calculate heat intensity for an area
function getHeatIntensity(
  properties: Property[],
  spots: Spot[],
  area: string,
  type: 'price' | 'schools' | 'transport' | 'safety' | 'noise' | 'flood'
): number {
  const areaProperties = properties.filter(p => p.area === area);
  const areaSpots = spots.filter(s => s.area === area);
  
  // Generate deterministic mock values based on area name for future data layers
  const areaHash = area.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mockValue = (areaHash % 100) / 100;
  
  switch (type) {
    case 'price':
      if (areaProperties.length === 0) return 0.2;
      const avgPrice = areaProperties.reduce((sum, p) => sum + p.price, 0) / areaProperties.length;
      // Normalize price to 0-1 range (assuming max 100M PKR)
      return Math.min(avgPrice / 100000000, 1);
    case 'schools':
      const schools = areaSpots.filter(s => s.category === 'education').length;
      return Math.min(schools / 5, 1);
    case 'transport':
      const transport = areaSpots.filter(s => s.category === 'transport').length;
      return Math.min(transport / 5, 1);
    case 'safety':
      // Mock: higher values = safer (inverted for display)
      return 1 - mockValue * 0.6; // Most areas are relatively safe
    case 'noise':
      // Mock: proximity to main areas = more noise
      return mockValue * 0.7;
    case 'flood':
      // Mock: Karachi coastal areas have higher risk
      return mockValue * 0.5;
    default:
      return 0.5;
  }
}

function getHeatColor(intensity: number, type: 'price' | 'schools' | 'transport' | 'safety' | 'noise' | 'flood'): string {
  const colors = {
    price: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'],
    schools: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b'],
    transport: ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e'],
    safety: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'], // Red = dangerous, Green = safe
    noise: ['#3b82f6', '#60a5fa', '#93c5fd', '#f97316', '#ef4444'], // Blue = quiet, Red = noisy
    flood: ['#22c55e', '#84cc16', '#eab308', '#06b6d4', '#0891b2'], // Green = low risk, Cyan = high risk
  };
  const index = Math.floor(intensity * 4);
  return colors[type][Math.min(index, 4)] || colors[type][0];
}

export default function PropertyMap({ 
  selectedCity = 'Karachi', 
  showHeatZones = true,
  heatZoneType = 'price' 
}: PropertyMapProps) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Fetch properties
  const { data: properties = [] } = useQuery({
    queryKey: ['map-properties', selectedCity],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('id, title, price, city, area, property_type, listing_type, bedrooms, bathrooms')
        .eq('status', 'active');
      
      if (selectedCity && selectedCity !== 'all') {
        query = query.eq('city', selectedCity);
      }
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as Property[];
    },
  });
  
  // Fetch spots
  const { data: spots = [] } = useQuery({
    queryKey: ['map-spots', selectedCity],
    queryFn: async () => {
      let query = supabase
        .from('spots')
        .select('id, name, category, city, area, latitude, longitude');
      
      if (selectedCity && selectedCity !== 'all') {
        query = query.eq('city', selectedCity);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Spot[];
    },
  });
  
  // Get unique areas
  const areas = [...new Set([...properties.map(p => p.area), ...spots.map(s => s.area)])];
  
  // Calculate bounds
  const bounds = areas.length > 0 
    ? new LatLngBounds(
        areas.map(area => {
          const prop = properties.find(p => p.area === area);
          return getAreaCoordinates(prop?.city || selectedCity, area);
        })
      )
    : null;
  
  const cityCenter = CITY_COORDINATES[selectedCity] || [30.3753, 69.3451];
  
  // Format price for display
  const formatPrice = (price: number) => {
    if (price >= 10000000) return `${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)} Lac`;
    return price.toLocaleString();
  };

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-border">
      {/* Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-lg">
        <div className="text-xs font-medium mb-2 text-foreground">Heat Zone: {heatZoneType}</div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="flex">
            {['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'].map((color, i) => (
              <div key={i} className="w-4 h-3" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {Object.entries(CATEGORY_ICONS).map(([category, Icon]) => (
          <Button
            key={category}
            size="sm"
            variant={activeCategory === category ? 'default' : 'secondary'}
            className="h-8 gap-1.5"
            onClick={() => setActiveCategory(activeCategory === category ? null : category)}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="capitalize text-xs">{category}</span>
          </Button>
        ))}
      </div>
      
      <MapContainer
        center={cityCenter}
        zoom={12}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds bounds={bounds} />
        
        {/* Heat zones for areas */}
        {showHeatZones && areas.map(area => {
          const coords = getAreaCoordinates(
            properties.find(p => p.area === area)?.city || selectedCity,
            area
          );
          const intensity = getHeatIntensity(properties, spots, area, heatZoneType);
          const color = getHeatColor(intensity, heatZoneType);
          const areaProperties = properties.filter(p => p.area === area);
          
          return (
            <CircleMarker
              key={`heat-${area}`}
              center={coords}
              radius={30 + intensity * 20}
              fillColor={color}
              fillOpacity={0.4}
              color={color}
              weight={2}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-semibold text-sm">{area}</h4>
                  <p className="text-xs text-muted-foreground">
                    {areaProperties.length} properties
                  </p>
                  {heatZoneType === 'price' && areaProperties.length > 0 && (
                    <p className="text-xs">
                      Avg: PKR {formatPrice(
                        areaProperties.reduce((sum, p) => sum + p.price, 0) / areaProperties.length
                      )}
                    </p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        
        {/* Property markers */}
        {properties.map(property => {
          const coords = getAreaCoordinates(property.city, property.area);
          // Add small random offset for multiple properties in same area
          const offset = (property.id.charCodeAt(0) % 10 - 5) * 0.002;
          
          return (
            <Marker
              key={property.id}
              position={[coords[0] + offset, coords[1] + offset]}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <h4 className="font-semibold text-sm line-clamp-1">{property.title}</h4>
                  <p className="text-primary font-bold">PKR {formatPrice(property.price)}</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {property.property_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {property.listing_type}
                    </Badge>
                  </div>
                  {(property.bedrooms || property.bathrooms) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {property.bedrooms && `${property.bedrooms} bed`}
                      {property.bedrooms && property.bathrooms && ' • '}
                      {property.bathrooms && `${property.bathrooms} bath`}
                    </p>
                  )}
                  <Button 
                    size="sm" 
                    className="w-full mt-2 h-7 text-xs"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Spot markers (filtered by category) */}
        {spots
          .filter(spot => !activeCategory || spot.category === activeCategory)
          .map(spot => {
            const coords = spot.latitude && spot.longitude 
              ? [spot.latitude, spot.longitude] as [number, number]
              : getAreaCoordinates(spot.city, spot.area);
            // Add offset to avoid overlap
            const offset = (spot.id.charCodeAt(0) % 20 - 10) * 0.001;
            const color = CATEGORY_COLORS[spot.category] || '#6b7280';
            
            return (
              <CircleMarker
                key={spot.id}
                center={[coords[0] + offset, coords[1] + offset]}
                radius={6}
                fillColor={color}
                fillOpacity={0.8}
                color="#fff"
                weight={2}
              >
                <Popup>
                  <div className="p-1">
                    <h4 className="font-semibold text-sm">{spot.name}</h4>
                    <Badge 
                      className="text-xs capitalize mt-1"
                      style={{ backgroundColor: color }}
                    >
                      {spot.category}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {spot.area}, {spot.city}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}
