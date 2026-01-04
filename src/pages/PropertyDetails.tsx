import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import NeighborhoodSpots from '@/components/property/NeighborhoodSpots';
import PriceChecker from '@/components/property/PriceChecker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  MapPin, Bed, Bath, Maximize2, Calendar, Eye, Phone, Mail, User,
  ChevronLeft, ChevronRight, Heart, Share2, ArrowLeft, Check, MessageCircle
} from 'lucide-react';
import { formatPriceWithUnit, LISTING_TYPES, PROPERTY_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Validation schema for inquiry form
const inquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200, 'Name must be less than 200 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().trim().max(20, 'Phone must be less than 20 characters').optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
});

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: owner } = useQuery({
    queryKey: ['property-owner', property?.user_id],
    queryFn: async () => {
      if (!property?.user_id) return null;
      const { data, error } = await supabase
        .rpc('get_property_owner_phones', { 
          property_user_ids: [property.user_id] 
        });
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!property?.user_id,
  });

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    // Validate form data
    const validationResult = inquirySchema.safeParse(inquiryForm);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    const validatedData = validationResult.data;

    setIsSubmitting(true);
    const { error } = await supabase.from('inquiries').insert({
      property_id: property.id,
      owner_id: property.user_id,
      sender_id: user?.id || null,
      sender_name: validatedData.name,
      sender_email: validatedData.email,
      sender_phone: validatedData.phone || null,
      message: validatedData.message,
      inquiry_type: property.listing_type === 'rent' ? 'rent' : 'buy',
    });

    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to send inquiry. Please try again.');
    } else {
      toast.success('Inquiry sent successfully! The property owner will contact you soon.');
      setInquiryForm({ name: '', email: '', phone: '', message: '' });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-80 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-heading font-bold">Property not found</h1>
          <Button asChild className="mt-4">
            <Link to="/properties">Browse Properties</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const listingType = LISTING_TYPES.find(t => t.value === property.listing_type);
  const propertyType = PROPERTY_TYPES.find(t => t.value === property.property_type);
  
  const images = property.images?.length 
    ? property.images 
    : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'];

  const getBadgeClass = () => {
    switch (property.listing_type) {
      case 'rent': return 'badge-rent';
      case 'sale': return 'badge-sale';
      case 'land': return 'badge-land';
      default: return '';
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-card">
              <img
                src={images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-smooth"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-smooth"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-smooth',
                          i === currentImageIndex ? 'bg-background' : 'bg-background/50'
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className={cn('font-medium', getBadgeClass())}>
                  {listingType?.label}
                </Badge>
                {property.featured && (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="icon" variant="secondary">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      'flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-smooth',
                      i === currentImageIndex ? 'border-primary' : 'border-transparent'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Property Info */}
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">{property.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{property.area}, {property.city}</span>
                {property.address && <span className="text-sm">• {property.address}</span>}
              </div>
              <p className="text-3xl font-bold text-primary mt-4">
                {formatPriceWithUnit(property.price, property.price_unit || 'total')}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.bedrooms && (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Bed className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-lg font-semibold">{property.bedrooms}</p>
                      <p className="text-xs text-muted-foreground">Bedrooms</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {property.bathrooms && (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Bath className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-lg font-semibold">{property.bathrooms}</p>
                      <p className="text-xs text-muted-foreground">Bathrooms</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Maximize2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-lg font-semibold">{property.size_value}</p>
                    <p className="text-xs text-muted-foreground">{property.size_unit}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-lg font-semibold">{propertyType?.label}</p>
                    <p className="text-xs text-muted-foreground">Type</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-secondary" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Neighborhood & Nearby Spots */}
            <Card>
              <CardContent className="p-6">
                <NeighborhoodSpots city={property.city} area={property.area} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent/Owner Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{owner?.full_name || 'Property Owner'}</p>
                    <p className="text-sm text-muted-foreground">Property Advisor</p>
                  </div>
                </div>
                {owner?.phone && (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${owner.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        {owner.phone}
                      </a>
                    </Button>
                    <Button 
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white" 
                      asChild
                    >
                      <a 
                        href={`https://wa.me/${owner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the property: ${property.title} (${formatPriceWithUnit(property.price, property.price_unit || 'total')}) at ${property.area}, ${property.city}. Is it still available?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Price Checker */}
            <PriceChecker property={property} />

            {/* Inquiry Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send Inquiry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={inquiryForm.phone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      placeholder="I'm interested in this property..."
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Views */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <Eye className="h-4 w-4" />
              <span>{property.views || 0} views</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails;
