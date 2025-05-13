
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/workers/runtime-apis/queues/
	// MY_QUEUE: Queue;
  OPENROUTER_API_KEY: string;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Preferred model: google/gemini-flash-1.5 or similar free/low-cost model
const LLM_MODEL = 'google/gemini-flash-1.5'; 

// CORS headers utility
function get_cors_headers() {
  return {
    'Access-Control-Allow-Origin': '*', // In production, restrict this to your extension's origin or app domain
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: get_cors_headers() });
    }

		if (request.method !== 'POST') {
			return new Response('Expected POST request', { status: 405, headers: get_cors_headers() });
		}

		let requestBody;
		try {
			requestBody = await request.json<{ textSegment: string; userGoal?: string }>();
		} catch (e) {
			return new Response('Invalid JSON body', { status: 400, headers: get_cors_headers() });
		}

		const { textSegment, userGoal } = requestBody;

		if (!textSegment || typeof textSegment !== 'string') {
			return new Response('Missing or invalid "textSegment" in request body', { status: 400, headers: get_cors_headers() });
		}

    if (!env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not set in worker environment.');
      return new Response('Server configuration error: API key missing.', { status: 500, headers: get_cors_headers() });
    }

    // Construct the prompt for the LLM, aligned with LLMInsight structure from types.ts
    const systemPrompt = `You are an expert cognitive bias detector. Analyze the provided text segment.
The user's current learning goal is: "${userGoal || 'general improvement in cognitive skills'}". Tailor your insight if relevant.

Output your findings in an XML-like format as follows:
<insight>
  <pattern_type>[Name of Bias or Pattern, e.g., Confirmation Bias, Anchoring. Use 'none' if no specific bias is clear but reflection is useful, or if no bias and no reflection is warranted.]</pattern_type>
  <hc_related>[Relevant HC_ID, e.g., bias-detection, critique, assumption-spotting. Use 'general-reflection' if pattern_type is 'none' and reflection is useful. If pattern_type is 'none' and no reflection is warranted, use 'none'.]</hc_related>
  <explanation>[Brief, youth-friendly explanation of why this pattern might be present, or a general reflection point if pattern_type is 'none'. If pattern_type and hc_related are 'none', this should be an empty string.]</explanation>
  <highlight_suggestion_css_selector>[Optional: A general CSS selector suggestion if a specific part of the text is key, e.g., ".sentence-3" or ".keyword-X". Be generic if unsure. Skip if not applicable or if pattern_type is 'none'.]</highlight_suggestion_css_selector>
  <micro_challenge_prompt>[A short, actionable question or prompt to encourage reflection. E.g., "What's one assumption here?". If pattern_type and hc_related are 'none', this should be an empty string.]</micro_challenge_prompt>
</insight>
If no significant cognitive pattern or bias is detected, and no reflection seems particularly warranted, output only: <insight><pattern_type>none</pattern_type><hc_related>none</hc_related><explanation></explanation><micro_challenge_prompt></micro_challenge_prompt></insight>
Focus on common biases like Confirmation Bias, Anchoring Bias, Availability Heuristic, Hasty Generalization, Straw Man, etc.`;

    const userMessage = `Text Segment to Analyze: "${textSegment}"`;

		try {
			const llmResponse = await fetch(OPENROUTER_API_URL, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
					'Content-Type': 'application/json',
          // OpenRouter might recommend specific headers for site identification
          // 'HTTP-Referer': 'YOUR_SITE_URL', // Replace with your app's URL
          // 'X-Title': 'Mindframe Local Coach', // Replace with your app's name
				},
				body: JSON.stringify({
					model: LLM_MODEL,
					messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
				}),
			});

			if (!llmResponse.ok) {
        const errorBody = await llmResponse.text();
				console.error(`OpenRouter API error: ${llmResponse.status} ${llmResponse.statusText}`, errorBody);
				return new Response(`LLM API error: ${llmResponse.statusText}. Details: ${errorBody}`, { status: llmResponse.status, headers: get_cors_headers() });
			}

			const llmData = await llmResponse.json<{ choices?: { message: { content: string } }[] }>();
      
      if (llmData.choices && llmData.choices.length > 0 && llmData.choices[0].message && llmData.choices[0].message.content) {
        const rawTextResponse = llmData.choices[0].message.content;
        // Return the raw XML-like text response
        return new Response(rawTextResponse, { headers: { ...get_cors_headers(), 'Content-Type': 'text/plain' } });
      } else {
        console.error('LLM response format unexpected:', llmData);
        return new Response('LLM response format error.', { status: 500, headers: get_cors_headers() });
      }

		} catch (error: any) {
			console.error('Error calling OpenRouter API:', error);
			return new Response(`Error processing LLM request: ${error.message}`, { status: 500, headers: get_cors_headers() });
		}
	},
};
