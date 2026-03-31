import { GoogleGenAI } from "@google/genai";

const REPLIT_PROXY_PATTERN = /localhost|127\.0\.0\.1|modelfarm/;

function createClient(): GoogleGenAI {
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "AI_INTEGRATIONS_GEMINI_API_KEY nie jest skonfigurowane.",
    );
  }

  const isReplitProxy = baseUrl && REPLIT_PROXY_PATTERN.test(baseUrl);

  if (isReplitProxy) {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        apiVersion: "",
        baseUrl,
      },
    });
  }

  return new GoogleGenAI({ apiKey });
}

let _client: GoogleGenAI | null = null;

export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    if (!_client) {
      _client = createClient();
    }
    return (_client as any)[prop];
  },
});
