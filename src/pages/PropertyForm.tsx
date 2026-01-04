import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, X, ShieldCheck } from 'lucide-react';
import { CITIES, PROPERTY_TYPES, LISTING_TYPES, SIZE_UNITS, PRICE_UNITS, AMENITIES } from '@/lib/constants';

const PropertyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: '',
    listing_type: '',
    price: '',
    price_unit: 'total',
    city: '',
    area: '',
    address: '',
    size_value: '',
    size_unit: 'marla',
    bedrooms: '',
    bathrooms: '',
    amenities: [] as string[],
    images: [] as string[],
    verified: false,
  });

  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing property if editing
  const { data: existingProperty, isLoading } = useQuery({
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
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingProperty) {
      setFormData({
        title: existingProperty.title,
        description: existingProperty.description,
        property_type: existingProperty.property_type,
        listing_type: existingProperty.listing_type,
        price: existingProperty.price.toString(),
        price_unit: existingProperty.price_unit || 'total',
        city: existingProperty.city,
        area: existingProperty.area,
        address: existingProperty.address || '',
        size_value: existingProperty.size_value.toString(),
        size_unit: existingProperty.size_unit,
        bedrooms: existingProperty.bedrooms?.toString() || '',
        bathrooms: existingProperty.bathrooms?.toString() || '',
        amenities: existingProperty.amenities || [],
        images: existingProperty.images || [],
        verified: existingProperty.verified || false,
      });
    }
  }, [existingProperty]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    const propertyData = {
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      property_type: formData.property_type,
      listing_type: formData.listing_type,
      price: parseInt(formData.price),
      price_unit: formData.price_unit,
      city: formData.city,
      area: formData.area,
      address: formData.address || null,
      size_value: parseFloat(formData.size_value),
      size_unit: formData.size_unit,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      amenities: formData.amenities,
      images: formData.images,
      verified: formData.verified,
    };

    let error;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('properties')
        .insert(propertyData);
      error = insertError;
    }

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isEditing ? 'Property updated successfully!' : 'Property listed successfully!');
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/dashboard');
    }
  };

  const addImage = () => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData({ ...formData, images: [...formData.images, imageUrl] });
      setImageUrl('');
    }
  };

  const removeImage = (url: string) => {
    setFormData({ ...formData, images: formData.images.filter((img) => img !== url) });
  };

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity],
      });
    }
  };

  if (isEditing && isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-heading">
              {isEditing ? 'Edit Property' : 'List New Property'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Beautiful 3 Bedroom House in DHA"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Property Type *</Label>
                    <Select
                      value={formData.property_type}
                      onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Listing Type *</Label>
                    <Select
                      value={formData.listing_type}
                      onValueChange={(value) => setFormData({ ...formData, listing_type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select listing type" />
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
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area/Sector *</Label>
                    <Input
                      id="area"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g., DHA Phase 5"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g., House 123, Street 45"
                    />
                  </div>
                </div>
              </div>

              {/* Price & Size */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Price & Size</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (PKR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g., 25000000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price Unit</Label>
                    <Select
                      value={formData.price_unit}
                      onValueChange={(value) => setFormData({ ...formData, price_unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICE_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Size *</Label>
                    <Input
                      id="size"
                      type="number"
                      step="0.01"
                      value={formData.size_value}
                      onChange={(e) => setFormData({ ...formData, size_value: e.target.value })}
                      placeholder="e.g., 10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Size Unit</Label>
                    <Select
                      value={formData.size_unit}
                      onValueChange={(value) => setFormData({ ...formData, size_unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZE_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your property in detail..."
                  rows={6}
                  required
                />
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Images</h3>
                <div className="flex gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addImage} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(img)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <label htmlFor={amenity} className="text-sm cursor-pointer">
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Verification</h3>
                <div className="flex items-center space-x-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <Checkbox
                    id="verified"
                    checked={formData.verified}
                    onCheckedChange={(checked) => setFormData({ ...formData, verified: checked === true })}
                  />
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <label htmlFor="verified" className="text-sm font-medium cursor-pointer">
                      Agent-Verified Listing
                    </label>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Property visited, photos verified, price confirmed
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Property' : 'List Property'}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PropertyForm;
