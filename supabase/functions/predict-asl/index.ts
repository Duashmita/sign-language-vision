import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const MODEL_API_URL = Deno.env.get('ASL_MODEL_API_URL');
    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    
    if (!MODEL_API_URL) {
      console.error('ASL_MODEL_API_URL is not configured');
      return new Response(
        JSON.stringify({ error: 'Model API URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!HUGGINGFACE_API_KEY) {
      console.error('HUGGINGFACE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Hugging Face API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending image to model API:', MODEL_API_URL);

    // Hugging Face endpoints expect an `inputs` key. For images, pass base64 without the data URL prefix.
    const inputs = typeof imageData === 'string'
      ? imageData.replace(/^data:image\/\w+;base64,/, '')
      : imageData;

    const makeRequest = () => fetch(MODEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({ inputs }),
    });

    // Inference Endpoints can take 30-60s to wake from cold start. Retry with backoff.
    let response = await makeRequest();
    let retries = 0;
    const maxRetries = 5;
    while (response.status === 503 && retries < maxRetries) {
      retries++;
      const waitSec = retries * 3; // 3s, 6s, 9s, 12s, 15s
      console.warn(`Model API returned 503; retry ${retries}/${maxRetries} after ${waitSec}s`);
      await new Promise((r) => setTimeout(r, waitSec * 1000));
      response = await makeRequest();
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Model API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Model prediction failed', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prediction = await response.json();
    console.log('Prediction received:', prediction);

    return new Response(
      JSON.stringify(prediction),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in predict-asl function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
