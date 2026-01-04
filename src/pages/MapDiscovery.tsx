import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import PropertyMap from '@/components/map/PropertyMap';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, TrendingUp, School, Train, Shield, Volume2, Droplets } from 'lucide-react';
import { CITIES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

export default function MapDiscovery() {
  const [selectedCity, setSelectedCity] = useState('Karachi');
  const [heatZoneType, setHeatZoneType] = useState<'price' | 'schools' | 'transport' | 'safety' | 'noise' | 'flood'>('price');

  return (
    <>
      <Helmet>
        <title>Map Discovery - Find Properties by Location | Homes Hub</title>
        <meta 
          name="description" 
          content="Explore properties on an interactive map with heat zones for price density, school proximity, and transport access across Pakistan." 
        />
      </Helmet>
      
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              Map Discovery
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Explore properties on an interactive map. View heat zones for price density, 
              school proximity, and transport access to find the perfect neighborhood.
            </p>
          </div>
          
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {CITIES.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Heat Zone Type</CardTitle>
                <CardDescription className="text-xs">
                  Color intensity shows concentration levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={heatZoneType} onValueChange={(v) => setHeatZoneType(v as typeof heatZoneType)}>
                  <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
                    <TabsTrigger value="price" className="gap-1.5 text-xs px-2">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">Price</span>
                    </TabsTrigger>
                    <TabsTrigger value="schools" className="gap-1.5 text-xs px-2">
                      <School className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">Schools</span>
                    </TabsTrigger>
                    <TabsTrigger value="transport" className="gap-1.5 text-xs px-2">
                      <Train className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">Transport</span>
                    </TabsTrigger>
                    <TabsTrigger value="safety" className="gap-1.5 text-xs px-2">
                      <Shield className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">Safety</span>
                    </TabsTrigger>
                    <TabsTrigger value="noise" className="gap-1.5 text-xs px-2">
                      <Volume2 className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">Noise</span>
                    </TabsTrigger>
                    <TabsTrigger value="flood" className="gap-1.5 text-xs px-2">
                      <Droplets className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">Flood</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Map */}
          <PropertyMap 
            selectedCity={selectedCity === 'all' ? undefined : selectedCity}
            showHeatZones={true}
            heatZoneType={heatZoneType}
          />
          
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Price Density
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Red zones indicate higher average property prices. 
                  Green zones show more affordable areas.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <School className="h-4 w-4 text-amber-500" />
                  School Proximity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Darker zones have more educational institutions nearby - 
                  schools, colleges, and universities.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Train className="h-4 w-4 text-green-500" />
                  Transport Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Green intensity shows areas with better public transport - 
                  metro stations, bus stops, and highways.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Safety Score
                  </div>
                  <Badge variant="outline" className="text-[10px] font-normal">Coming Soon</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Crowd-sourced & police data combined for neighborhood safety ratings. 
                  Green = safer areas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/5 border-purple-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-purple-500" />
                    Noise Level
                  </div>
                  <Badge variant="outline" className="text-[10px] font-normal">Coming Soon</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Areas near airports, main roads, and industrial zones. 
                  Blue = quieter neighborhoods.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-cyan-500/5 border-cyan-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-cyan-500" />
                    Flood Risk
                  </div>
                  <Badge variant="outline" className="text-[10px] font-normal">Coming Soon</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Historical flood data & drainage analysis. Critical for Karachi! 
                  Green = lower risk.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </>
  );
}
