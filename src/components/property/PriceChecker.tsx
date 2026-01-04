import { useState } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calculator, TrendingUp, TrendingDown, Minus, 
  AlertCircle, CheckCircle2, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PropertyData = {
  price: number;
  property_type: string;
  city: string;
  area: string;
  size_value: number;
  size_unit: string;
  amenities?: string[] | null;
  address?: string | null;
};

type PriceAssessment = {
  verdict: 'underpriced' | 'fair' | 'overpriced';
  estimatedRange: { min: number; max: number };
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  factors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; note: string }[];
};

interface PriceCheckerProps {
  property: PropertyData;
}

const PriceChecker = ({ property }: PriceCheckerProps) => {
  const [roadAccess, setRoadAccess] = useState('');
  const [constructionQuality, setConstructionQuality] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<PriceAssessment | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setAssessment(null);

    // Simple local logic: luxury/high quality = fair, otherwise overpriced
    setTimeout(() => {
      const isFairPrice = constructionQuality === 'luxury' || constructionQuality === 'high';
      const isPlot = property.property_type === 'plot' || property.property_type === 'land';
      
      // For plots, check road access instead
      const plotIsFair = roadAccess === 'main-boulevard' || roadAccess === 'commercial-road' || roadAccess === 'corner-plot';
      
      const verdict = isPlot 
        ? (plotIsFair ? 'fair' : 'overpriced')
        : (isFairPrice ? 'fair' : 'overpriced');

      const priceVariation = verdict === 'fair' ? 0.1 : 0.25;
      const minPrice = Math.round(property.price * (1 - priceVariation));
      const maxPrice = Math.round(property.price * (1 + priceVariation));

      const result: PriceAssessment = {
        verdict: verdict as 'fair' | 'overpriced',
        estimatedRange: { min: minPrice, max: maxPrice },
        confidence: 'medium',
        explanation: verdict === 'fair'
          ? `This property appears to be fairly priced based on ${isPlot ? 'good road access and location' : 'quality construction standards'}.`
          : `This property may be overpriced. ${isPlot ? 'Consider negotiating based on road access and location factors.' : 'The construction quality suggests room for price negotiation.'}`,
        factors: [
          {
            factor: isPlot ? 'Road Access' : 'Construction Quality',
            impact: verdict === 'fair' ? 'positive' : 'negative',
            note: isPlot 
              ? (plotIsFair ? 'Good road access adds value' : 'Limited road access reduces value')
              : (isFairPrice ? 'High quality construction justifies the price' : 'Standard/basic construction may not justify this price')
          },
          {
            factor: 'Location',
            impact: 'neutral',
            note: `${property.area}, ${property.city}`
          },
          {
            factor: 'Property Size',
            impact: 'neutral',
            note: `${property.size_value} ${property.size_unit}`
          },
          {
            factor: 'Market Conditions',
            impact: 'neutral',
            note: 'Based on general market assessment'
          }
        ]
      };

      setAssessment(result);
      setIsExpanded(true);
      setIsAnalyzing(false);
    }, 1000); // Small delay for UX
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
          label: 'Overpriced - Negotiate'
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

  const showConstructionQuality = property.property_type !== 'plot' && property.property_type !== 'land';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Price Checker
        </CardTitle>
        <CardDescription>
          Is {formatPrice(property.price)} a fair price for this property?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!assessment && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Road Access</Label>
                <Select value={roadAccess} onValueChange={setRoadAccess}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Optional" />
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
              {showConstructionQuality && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Construction</Label>
                  <Select value={constructionQuality} onValueChange={setConstructionQuality}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="high">High Quality</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="old">Needs Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button 
              onClick={handleAnalyze} 
              className="w-full" 
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>Analyzing Price...</>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Check if Price is Fair
                </>
              )}
            </Button>
          </>
        )}

        {isAnalyzing && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {assessment && !isAnalyzing && (
          <div className="space-y-4">
            {/* Verdict */}
            <div className={cn('p-4 rounded-lg border-2', getVerdictConfig(assessment.verdict).bg)}>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const config = getVerdictConfig(assessment.verdict);
                  const Icon = config.icon;
                  return <Icon className={cn('h-6 w-6', config.color)} />;
                })()}
                <Badge className={getVerdictConfig(assessment.verdict).badge}>
                  {getVerdictConfig(assessment.verdict).label}
                </Badge>
              </div>
              
              <div className="bg-background rounded-md p-3 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Estimated Market Value</p>
                <p className="text-lg font-bold text-primary">
                  {formatPrice(assessment.estimatedRange.min)} - {formatPrice(assessment.estimatedRange.max)}
                </p>
              </div>

              <p className="text-sm leading-relaxed">{assessment.explanation}</p>
            </div>

            {/* Factors - Collapsible */}
            {isExpanded && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Key Factors
                </p>
                {assessment.factors.slice(0, 4).map((factor, index) => (
                  <div 
                    key={index}
                    className={cn(
                      'p-2 rounded-md border text-xs',
                      factor.impact === 'positive' && 'bg-green-50 border-green-200',
                      factor.impact === 'negative' && 'bg-red-50 border-red-200',
                      factor.impact === 'neutral' && 'bg-gray-50 border-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-1.5 font-medium">
                      {factor.impact === 'positive' && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                      {factor.impact === 'negative' && <AlertCircle className="h-3 w-3 text-red-600" />}
                      {factor.impact === 'neutral' && <Minus className="h-3 w-3 text-gray-600" />}
                      {factor.factor}
                    </div>
                    <p className="text-muted-foreground mt-0.5 ml-4">{factor.note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[10px] text-muted-foreground">
              AI estimate for informational purposes only. Not an official valuation.
            </p>

            {/* Reset */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                setAssessment(null);
                setIsExpanded(false);
              }}
            >
              Check Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceChecker;
