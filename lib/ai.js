import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Connect to OpenRouter API to analyze Korean administrative documents.
 * Retries with base64 if the public URL fails.
 */
export async function analyzeDocumentWithOpenRouter({ imageUrl, base64Image, userLanguage = 'English', region = 'Pohang-si Buk-gu', mimeType = 'image/jpeg' }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const preferredModel = process.env.OPENROUTER_MODEL || "openrouter/free";
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const prompt = buildAnalysisPrompt(userLanguage, region);

  // Helper to call OpenRouter API
  const callOpenRouter = async (model, imgContent) => {
    console.log(`[OpenRouter] model: ${model}`);
    const isUrl = imgContent === imageUrl;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://k-pass.vercel.app",
        "X-Title": "K-Pass",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: isUrl ? imageUrl : `data:${mimeType};base64,${imgContent}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const status = response.status;
    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`[OpenRouter] Failed to parse response: ${responseText.substring(0, 500)}`);
      throw new Error(`OpenRouter API error (Status ${status})`);
    }

    if (!response.ok || data.error) {
      const errorMsg = data.error?.message || responseText;
      console.warn(`[OpenRouter] Error body: ${JSON.stringify(data.error || data)}`);
      throw new Error(`OpenRouter API error: ${errorMsg}`);
    }

    return data;
  };

  try {
    try {
      const data = await callOpenRouter(preferredModel, imageUrl);
      return parseOpenRouterResponse(data);
    } catch (err) {
      if (preferredModel !== "openrouter/free") {
        console.warn(`[OpenRouter] Preferred model ${preferredModel} failed, retrying with openrouter/free...`);
        const data = await callOpenRouter("openrouter/free", imageUrl);
        return parseOpenRouterResponse(data);
      }
      throw err;
    }
  } catch (firstPassErr) {
    if (base64Image) {
      console.warn(`[OpenRouter] Public URL analysis failed, retrying with base64 fallback...`);
      try {
        const data = await callOpenRouter(preferredModel, base64Image);
        return parseOpenRouterResponse(data);
      } catch (retryErr) {
        throw new Error(`OpenRouter failed (Public URL & Base64): ${retryErr.message}`);
      }
    }
    throw firstPassErr;
  }
}

/**
 * Safely extract and parse JSON from OpenRouter response
 */
function parseOpenRouterResponse(data) {
  let content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned an empty response.");

  if (Array.isArray(content)) {
    content = content.map(part => part.text || "").join("");
  }

  let jsonString = content.trim();
  if (jsonString.startsWith('```')) {
    jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  }

  try {
    const parsed = JSON.parse(jsonString);
    return normalizeAnalysisResult(parsed);
  } catch (e) {
    console.error('[OpenRouter] JSON Parse or Normalization failed');
    throw new Error("Failed to parse AI response.");
  }
}

/**
 * Normalizes different AI response shapes into a flat object.
 */
export function normalizeAnalysisResult(data) {
  if (!data) return null;

  let result = data;
  if (Array.isArray(data) && data.length > 0) {
    result = data[0];
  } else if (data["0"] && typeof data["0"] === 'object') {
    result = data["0"];
  }

  if (typeof result !== 'object' || result === null) return data; 

  return {
    document_type: result.document_type || null,
    issuer: result.issuer || null,
    deadline: result.deadline || null,
    amount: result.amount || null,
    urgency: result.urgency || 'normal',
    simple_korean_summary: result.simple_korean_summary || null,
    translated_summary: result.translated_summary || null,
    action_steps: Array.isArray(result.action_steps) ? result.action_steps : [],
    risk_if_ignored: result.risk_if_ignored || null,
    local_context: result.local_context || null,
    nearby_place: result.nearby_place || null
  };
}

/**
 * Shared prompt builder for both Gemini and OpenRouter
 */
export function buildAnalysisPrompt(language, region) {
  const isKorean = language === 'Korean' || language === 'ko';
  
  return `
    You are K-Pass, an expert AI administrative assistant for foreign residents in South Korea (specifically ${region}).
    Your task is to analyze the provided image of a Korean administrative notice and provide accurate, actionable guidance in ${language}.

    SUPPORTED LANGUAGES:
    - Korean, English, Vietnamese, Chinese, Indonesian.
    
    GLOBAL RULES:
    1. ANALYZE ONLY VISIBLE TEXT. Do not invent facts.
    2. Respond in ${language}.
    3. Keep official institution names (포항남부경찰서), service names (이파인), and URLs in Korean or their original form. Add a short explanation in ${language} if helpful.
    4. simple_korean_summary: ALWAYS in Korean.
    5. translated_summary, action_steps, risk_if_ignored, local_context: ALWAYS in ${language}.
    6. nearby_place.description: ALWAYS in ${language}.
    7. If a value (deadline, amount) is unclear, return null.
    8. DO NOT sum different amounts (e.g., Traffic fine vs Administrative fine). Explain the difference instead.

    DOCUMENT SPECIFIC GUIDANCE:
    - Traffic Fines: Identify 범칙금 (fine for driver) and 과태료 (fine for owner). Mention efine.go.kr, Call 182, or the specific police station.
    - Local Tax: Mention Wetax (www.wetax.go.kr), virtual accounts, or the local tax office.
    - Trash/Waste: Explain disposal rules or fines for illegal dumping. Mention localized disposal bags.
    - Health Insurance (NHIS): Identify premiums or arrears. Mention www.nhis.or.kr or 1577-1000.
    - Immigration/Visa: Identify required actions, documents, and deadlines. Mention HiKorea (www.hikorea.go.kr) or 1345.

    VISA IMPACT WARNING:
    - ONLY mention visa/stay status risks if the document is related to delinquency (taxes, insurance) or immigration violations. 
    - For general notices, use a neutral warning about late fees or loss of discounts.
    - If unsure, use: "It is safer to resolve this promptly to avoid any future administrative complications." (translated to ${language}).

    JSON RESPONSE SHAPE:
    {
      "document_type": "string",
      "issuer": "string",
      "deadline": "YYYY-MM-DD | null",
      "amount": "string | null",
      "urgency": "urgent | normal | info",
      "simple_korean_summary": "string",
      "translated_summary": "string",
      "action_steps": ["string"],
      "risk_if_ignored": "string | null",
      "local_context": "string",
      "nearby_place": {
        "name": "string",
        "type": "string",
        "address": "string",
        "phone": "string",
        "map_url": "string",
        "website_url": "string",
        "description": "string"
      }
    }
  `;
}
