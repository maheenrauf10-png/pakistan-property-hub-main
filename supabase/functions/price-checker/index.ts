import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      askingPrice, 
      propertyType, 
      city, 
      area, 
      size, 
      sizeUnit,
      roadAccess,
      nearbyAmenities,
      constructionQuality,
      additionalDetails 
    } = await req.json();

    const prompt = `You are a real estate price analyst for Pakistan's property market. Analyze this property and provide a price assessment.

Property Details:
- Asking Price: PKR ${askingPrice.toLocaleString()}
- Property Type: ${propertyType}
- City: ${city}
- Area/Locality: ${area}
- Size: ${size} ${sizeUnit}
${roadAccess ? `- Road Access: ${roadAccess}` : ''}
${constructionQuality ? `- Construction Quality: ${constructionQuality}` : ''}
${nearbyAmenities ? `- Nearby Amenities: ${nearbyAmenities}` : ''}
${additionalDetails ? `- Additional Details: ${additionalDetails}` : ''}

Based on your knowledge of Pakistan's real estate market (especially ${city}), analyze whether this asking price is fair.

Consider these factors:
1. Location premium (prime areas like DHA, Bahria Town command higher prices)
2. Property type and size
3. Road access and plot position
4. Nearby amenities and development status
5. Construction quality (if applicable)
6. Current market trends in the area

Respond ONLY with a valid JSON object in this exact format (no markdown, no code blocks):
{
  "verdict": "underpriced" | "fair" | "overpriced",
  "estimatedRange": {
    "min": <number in PKR>,
    "max": <number in PKR>
  },
  "confidence": "low" | "medium" | "high",
  "explanation": "<2-3 sentences in simple language explaining the assessment>",
  "factors": [
    {
      "factor": "<factor name>",
      "impact": "positive" | "negative" | "neutral",
      "note": "<brief explanation>"
    }
  ]
}

Include 4-6 relevant factors. Be realistic with price estimates based on actual market rates in Pakistan.`;

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai-gateway.lovable.dev/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let assessment;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      assessment = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse price assessment');
    }

    return new Response(JSON.stringify(assessment), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in price-checker function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze price';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
