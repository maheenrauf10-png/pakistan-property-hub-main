import { useState } from 'react';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calculator, MapPin, Ruler, Home, Building2, LandPlot, 
  TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2,
  IndianRupee, Info
} from 'lucide-react';
import { CITIES, PROPERTY_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const priceCheckerSchema = z.object({
  askingPrice: z.number().min(1, 'Please enter the asking price'),
  propertyType: z.string().min(1, 'Please select property type'),
  city: z.string().min(1, 'Please select city'),
  area: z.string().min(1, 'Please enter the area/locality'),
  size: z.number().min(1, 'Please enter the size'),
  sizeUnit: z.string().min(1, 'Please select size unit'),
  roadAccess: z.string().optional(),
  nearbyAmenities: z.string().optional(),
  constructionQuality: z.string().optional(),
  additionalDetails: z.string().optional(),
});

type PriceAssessment = {
  verdict: 'underpriced' | 'fair' | 'overpriced';
  estimatedRange: { min: number; max: number };
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  factors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; note: string }[];
};

const PriceChecker = () => {
  const [formData, setFormData] = useState({
    askingPrice: '',
    propertyType: '',
    city: '',
    area: '',
    size: '',
    sizeUnit: 'sq.ft',
    roadAccess: '',
    nearbyAmenities: '',
    constructionQuality: '',
    additionalDetails: '',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<PriceAssessment | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsed = priceCheckerSchema.safeParse({
      ...formData,
      askingPrice: parseFloat(formData.askingPrice) || 0,
      size: parseFloat(formData.size) || 0,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setIsAnalyzing(true);
    setAssessment(null);

    try {
      const { data, error } = await supabase.functions.invoke('price-checker', {
        body: parsed.data,
      });

      if (error) throw error;
      setAssessment(data);
    } catch (error: any) {
      console.error('Price check error:', error);
      toast.error('Failed to analyze price. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'underpriced':
        return { 
          icon: TrendingDown, 
          color: 'text-green-600', 
          bg: 'bg-green-50 border-green-200',
          badge: 'bg-green-100 text-green-800',
          label: 'Underpriced - Good Deal!'
        };
      case 'overpriced':
        return { 
          icon: TrendingUp, 
          color: 'text-red-600', 
          bg: 'bg-red-50 border-red-200',
          badge: 'bg-red-100 text-red-800',
          label: 'Overpriced - Consider Negotiating'
        };
      default:
        return { 
          icon: Minus, 
          color: 'text-blue-600', 
          bg: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-800',
          label: 'Fairly Priced'
        };
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold flex items-center justify-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            Property Price Checker
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Get an AI-powered estimate to check if a property's asking price is fair. 
            This is an informational tool to help you make better decisions.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Property Details
              </CardTitle>
              <CardDescription>
                Enter the property information to get a price assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="askingPrice">Asking Price (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="askingPrice"
                      type="number"
                      placeholder="e.g., 50000000 for 5 Crore"
                      value={formData.askingPrice}
                      onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                  {formData.askingPrice && (
                    <p className="text-sm text-muted-foreground">
                      = {formatPrice(parseFloat(formData.askingPrice) || 0)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
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
                  <Label>City</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
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
                  <Label htmlFor="area">Area/Locality</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="area"
                      placeholder="e.g., DHA Phase 5, Gulberg"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      type="number"
                      placeholder="e.g., 500"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select
                      value={formData.sizeUnit}
                      onValueChange={(value) => setFormData({ ...formData, sizeUnit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sq.ft">Sq. Ft</SelectItem>
                        <SelectItem value="sq.yd">Sq. Yard</SelectItem>
                        <SelectItem value="marla">Marla</SelectItem>
                        <SelectItem value="kanal">Kanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Road Access</Label>
                  <Select
                    value={formData.roadAccess}
                    onValueChange={(value) => setFormData({ ...formData, roadAccess: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select road access" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main-boulevard">Main Boulevard</SelectItem>
                      <SelectItem value="commercial-road">Commercial Road</SelectItem>
                      <SelectItem value="residential-street">Residential Street</SelectItem>
                      <SelectItem value="corner-plot">Corner Plot</SelectItem>
                      <SelectItem value="back-lane">Back Lane</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.propertyType && formData.propertyType !== 'plot' && formData.propertyType !== 'land' && (
                  <div className="space-y-2">
                    <Label>Construction Quality</Label>
                    <Select
                      value={formData.constructionQuality}
                      onValueChange={(value) => setFormData({ ...formData, constructionQuality: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="luxury">Luxury / Premium</SelectItem>
                        <SelectItem value="high">High Quality</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="basic">Basic / Economy</SelectItem>
                        <SelectItem value="old">Old / Needs Renovation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="nearbyAmenities">Nearby Amenities</Label>
                  <Input
                    id="nearbyAmenities"
                    placeholder="e.g., School, Hospital, Mall, Park"
                    value={formData.nearbyAmenities}
                    onChange={(e) => setFormData({ ...formData, nearbyAmenities: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalDetails">Additional Details (Optional)</Label>
                  <Textarea
                    id="additionalDetails"
                    placeholder="Any other relevant information about the property..."
                    value={formData.additionalDetails}
                    onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>Analyzing...</>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Check Price
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {isAnalyzing && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            )}

            {assessment && !isAnalyzing && (
              <>
                {/* Verdict Card */}
                <Card className={cn('border-2', getVerdictConfig(assessment.verdict).bg)}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {(() => {
                        const config = getVerdictConfig(assessment.verdict);
                        const Icon = config.icon;
                        return <Icon className={cn('h-8 w-8', config.color)} />;
                      })()}
                      <div>
                        <Badge className={getVerdictConfig(assessment.verdict).badge}>
                          {getVerdictConfig(assessment.verdict).label}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Confidence: {assessment.confidence}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-background rounded-lg p-4 mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Estimated Market Value</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(assessment.estimatedRange.min)} - {formatPrice(assessment.estimatedRange.max)}
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed">{assessment.explanation}</p>
                  </CardContent>
                </Card>

                {/* Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Factors Considered</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assessment.factors.map((factor, index) => (
                      <div 
                        key={index}
                        className={cn(
                          'p-3 rounded-lg border',
                          factor.impact === 'positive' && 'bg-green-50 border-green-200',
                          factor.impact === 'negative' && 'bg-red-50 border-red-200',
                          factor.impact === 'neutral' && 'bg-gray-50 border-gray-200'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {factor.impact === 'positive' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                          {factor.impact === 'negative' && <AlertCircle className="h-4 w-4 text-red-600" />}
                          {factor.impact === 'neutral' && <Minus className="h-4 w-4 text-gray-600" />}
                          <span className="font-medium text-sm">{factor.factor}</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">{factor.note}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">
                      <strong>Disclaimer:</strong> This is an AI-generated estimate for informational purposes only. 
                      It is not an official property valuation. Actual market prices may vary based on numerous factors. 
                      We recommend consulting with local real estate professionals for accurate valuations.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {!assessment && !isAnalyzing && (
              <Card className="bg-muted/30">
                <CardContent className="p-8 text-center">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Enter Property Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill in the form to get an AI-powered price assessment for the property.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PriceChecker;
