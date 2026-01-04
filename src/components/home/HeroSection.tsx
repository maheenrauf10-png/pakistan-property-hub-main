import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Building2, Home, TreeDeciduous } from 'lucide-react';
import { CITIES, LISTING_TYPES } from '@/lib/constants';

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedType) params.set('listing_type', selectedType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative gradient-hero py-20 md:py-32">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0xMHY2aDZ2LTZoLTZ6bTAgLTEwdjZoNnYtNmgtNnptMTAgMTB2Nmg2di02aC02em0wLTEwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6 animate-fade-in">
            Find Your Perfect Property in Pakistan
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Browse thousands of properties for rent, sale, and investment across 10 major cities.
            Your dream home is just a search away.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-background rounded-lg p-4 md:p-6 shadow-hero animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  type="text"
                  placeholder="Search by location, property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12"
                />
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="lg" className="w-full md:w-auto mt-4">
              <Search className="h-5 w-5 mr-2" />
              Search Properties
            </Button>
          </form>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/20 mb-3">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-primary-foreground">60+</p>
            <p className="text-sm text-primary-foreground/70">Properties</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/20 mb-3">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-primary-foreground">10</p>
            <p className="text-sm text-primary-foreground/70">Cities</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-foreground/20 mb-3">
              <TreeDeciduous className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-primary-foreground">20+</p>
            <p className="text-sm text-primary-foreground/70">Land Plots</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
