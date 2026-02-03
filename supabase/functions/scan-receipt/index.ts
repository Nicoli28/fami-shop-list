/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScannedReceiptData {
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  market: string | null;
  payment_method: string | null;
  purchase_date: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing receipt image with AI vision...');

    const prompt = `Analise esta imagem de uma nota fiscal/cupom fiscal de supermercado ou mercado brasileiro e extraia as seguintes informações em formato JSON:

1. "items": array de produtos com:
   - "name": nome do produto (limpo, sem códigos)
   - "quantity": quantidade (número, default 1)
   - "unit_price": preço unitário em reais (número decimal)
   - "total_price": preço total do item (número decimal)

2. "total_amount": valor total da compra em reais (número decimal)

3. "market": nome do estabelecimento/mercado (string ou null)

4. "payment_method": forma de pagamento identificada - pode ser: "Dinheiro", "Débito", "Crédito", "PIX", "VR", "VA" ou null se não identificado

5. "purchase_date": data da compra no formato "YYYY-MM-DD" ou null se não identificada

IMPORTANTE:
- Retorne APENAS o JSON válido, sem markdown ou texto adicional
- Use números decimais para preços (ex: 12.99, não "R$ 12,99")
- Se não conseguir identificar algum campo, use null
- Para itens, tente extrair o máximo possível mesmo que alguns campos estejam incompletos
- Ignore linhas que são códigos de barras, totais parciais, ou informações fiscais

Exemplo de resposta esperada:
{
  "items": [
    {"name": "Arroz 5kg", "quantity": 1, "unit_price": 25.90, "total_price": 25.90},
    {"name": "Feijão 1kg", "quantity": 2, "unit_price": 8.50, "total_price": 17.00}
  ],
  "total_amount": 42.90,
  "market": "Supermercado Extra",
  "payment_method": "Débito",
  "purchase_date": "2024-01-15"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to process image with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the response
    let receiptData: ScannedReceiptData;
    try {
      // Try to extract JSON from the response (it might have markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        receiptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse receipt data', raw: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Receipt data parsed successfully:', receiptData);

    return new Response(
      JSON.stringify({ success: true, data: receiptData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing receipt:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
