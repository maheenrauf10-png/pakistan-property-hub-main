import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Maximize2, Heart, Scale, ShieldCheck, MessageCircle } from 'lucide-react';
import { formatPriceWithUnit, LISTING_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useComparison } from '@/hooks/useComparison';
import { toast } from 'sonner';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    price_unit: string;
    city: string;
    area: string;
    size_value: number;
    size_unit: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    listing_type: string;
    property_type: string;
    images?: string[] | null;
    featured?: boolean;
    amenities?: string[] | null;
    verified?: boolean;
    owner_phone?: string | null;
  };
  showFavorite?: boolean;
  isFavorited?: boolean;
  onFavoriteClick?: () => void;
}

const PropertyCard = ({ property, showFavorite, isFavorited, onFavoriteClick }: PropertyCardProps) => {
  const { addProperty, removeProperty, isInComparison, properties: comparisonProperties } = useComparison();
  const isComparing = isInComparison(property.id);
  const listingType = LISTING_TYPES.find(t => t.value === property.listing_type);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isComparing) {
      removeProperty(property.id);
      toast.success('Removed from comparison');
    } else {
      if (comparisonProperties.length >= 4) {
        toast.error('Maximum 4 properties can be compared');
        return;
      }
      addProperty(property);
      toast.success('Added to comparison');
    }
  };
  
  const getBadgeClass = () => {
    switch (property.listing_type) {
      case 'rent':
        return 'badge-rent';
      case 'sale':
        return 'badge-sale';
      case 'land':
        return 'badge-land';
      default:
        return '';
    }
  };

  const placeholderImage = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop`;

  return (
    <Card className="group overflow-hidden shadow-card hover:shadow-card-hover transition-smooth">
      <Link to={`/properties/${property.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.images?.[0] || placeholderImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge className={cn('font-medium', getBadgeClass())}>
              {listingType?.label}
            </Badge>
            {property.verified && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {property.featured && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                Featured
              </Badge>
            )}
          </div>
          {showFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onFavoriteClick?.();
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-smooth"
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-smooth',
                  isFavorited ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                )}
              />
            </button>
          )}
          <button
            onClick={handleCompareClick}
            className={cn(
              "absolute top-3 p-2 rounded-full transition-smooth",
              showFavorite ? "right-14" : "right-3",
              isComparing 
                ? "bg-primary text-primary-foreground" 
                : "bg-background/80 hover:bg-background text-muted-foreground"
            )}
          >
            <Scale className="h-5 w-5" />
          </button>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/properties/${property.id}`}>
          <h3 className="font-heading font-semibold text-lg line-clamp-1 group-hover:text-primary transition-smooth">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{property.area}, {property.city}</span>
          </div>
          <p className="mt-3 text-xl font-bold text-primary">
            {formatPriceWithUnit(property.price, property.price_unit)}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Maximize2 className="h-4 w-4" />
                <span>{property.size_value} {property.size_unit}</span>
              </div>
            </div>
            {property.owner_phone && (
              <a
                href={`https://wa.me/${property.owner_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property: ${property.title} - ${formatPriceWithUnit(property.price, property.price_unit)} at ${property.area}, ${property.city}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-[#25D366] hover:bg-[#128C7E] text-white transition-smooth"
                title="Contact via WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
