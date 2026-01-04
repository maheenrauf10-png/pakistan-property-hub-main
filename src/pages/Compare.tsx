import { Link } from 'react-router-dom';
import { useComparison } from '@/hooks/useComparison';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Scale, ArrowLeft, Bed, Bath, Maximize2, MapPin, Check, Minus } from 'lucide-react';
import { formatPriceWithUnit, LISTING_TYPES, PROPERTY_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const Compare = () => {
  const { properties, removeProperty, clearAll } = useComparison();

  const getListingLabel = (value: string) => 
    LISTING_TYPES.find(t => t.value === value)?.label || value;

  const getPropertyTypeLabel = (value: string) => 
    PROPERTY_TYPES.find(t => t.value === value)?.label || value;

  const getBadgeClass = (listingType: string) => {
    switch (listingType) {
      case 'rent': return 'badge-rent';
      case 'sale': return 'badge-sale';
      case 'land': return 'badge-land';
      default: return '';
    }
  };

  // Get all unique amenities across all properties
  const allAmenities = [...new Set(
    properties.flatMap(p => p.amenities || [])
  )].sort();

  if (properties.length === 0) {
    return (
      <Layout>
        <div className="container-custom py-16 text-center">
          <Scale className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-heading font-bold mb-2">No Properties to Compare</h1>
          <p className="text-muted-foreground mb-6">
            Add properties to compare by clicking the compare button on property cards
          </p>
          <Button asChild>
            <Link to="/properties">Browse Properties</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideCompareBar>
      <div className="bg-muted py-6">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/properties">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-heading font-bold">Compare Properties</h1>
                <p className="text-muted-foreground text-sm">
                  Comparing {properties.length} properties
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left p-4 bg-muted/50 rounded-tl-lg font-medium text-muted-foreground w-40">
                  Property
                </th>
                {properties.map((property) => (
                  <th key={property.id} className="p-4 bg-muted/50 text-left min-w-[200px]">
                    <div className="relative">
                      <button
                        onClick={() => removeProperty(property.id)}
                        className="absolute -top-2 -right-2 p-1 bg-background rounded-full shadow hover:bg-muted transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Link to={`/properties/${property.id}`}>
                        <img
                          src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'}
                          alt={property.title}
                          className="w-full aspect-[4/3] object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                      </Link>
                      <Badge className={cn('mt-2', getBadgeClass(property.listing_type))}>
                        {getListingLabel(property.listing_type)}
                      </Badge>
                    </div>
                  </th>
                ))}
                {properties.length < 4 && (
                  <th className="p-4 bg-muted/50 rounded-tr-lg min-w-[200px]">
                    <Link 
                      to="/properties" 
                      className="flex items-center justify-center aspect-[4/3] border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <span className="text-muted-foreground text-sm">+ Add Property</span>
                    </Link>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Price</td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4">
                    <span className="text-lg font-bold text-primary">
                      {formatPriceWithUnit(property.price, property.price_unit)}
                    </span>
                  </td>
                ))}
                {properties.length < 4 && <td className="p-4" />}
              </tr>

              {/* Location */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Location</td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4">
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{property.area}, {property.city}</span>
                    </div>
                  </td>
                ))}
                {properties.length < 4 && <td className="p-4" />}
              </tr>

              {/* Property Type */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Property Type</td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4 text-sm">
                    {getPropertyTypeLabel(property.property_type)}
                  </td>
                ))}
                {properties.length < 4 && <td className="p-4" />}
              </tr>

              {/* Size */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Size</td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Maximize2 className="h-4 w-4 text-muted-foreground" />
                      <span>{property.size_value} {property.size_unit}</span>
                    </div>
                  </td>
                ))}
                {properties.length < 4 && <td className="p-4" />}
              </tr>

              {/* Bedrooms */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Bedrooms</td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4">
                    {property.bedrooms ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <span>{property.bedrooms}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
                {properties.length < 4 && <td className="p-4" />}
              </tr>

              {/* Bathrooms */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Bathrooms</td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4">
                    {property.bathrooms ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Bath className="h-4 w-4 text-muted-foreground" />
                        <span>{property.bathrooms}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
                {properties.length < 4 && <td className="p-4" />}
              </tr>

              {/* Amenities Header */}
              {allAmenities.length > 0 && (
                <tr className="bg-muted/30">
                  <td colSpan={properties.length + (properties.length < 4 ? 2 : 1)} className="p-4 font-semibold">
                    Amenities
                  </td>
                </tr>
              )}

              {/* Individual Amenities */}
              {allAmenities.map((amenity) => (
                <tr key={amenity} className="border-b border-border">
                  <td className="p-4 text-sm text-muted-foreground">{amenity}</td>
                  {properties.map((property) => (
                    <td key={property.id} className="p-4">
                      {property.amenities?.includes(amenity) ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </td>
                  ))}
                  {properties.length < 4 && <td className="p-4" />}
                </tr>
              ))}

              {/* View Details */}
              <tr>
                <td className="p-4"></td>
                {properties.map((property) => (
                  <td key={property.id} className="p-4">
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/properties/${property.id}`}>View Details</Link>
                    </Button>
                  </td>
                ))}
                {properties.length < 4 && <td className="p-4" />}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Compare;
