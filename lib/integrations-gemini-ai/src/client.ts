import { GoogleGenAI } from "@google/genai";

function createClient(): GoogleGenAI {
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "AI_INTEGRATIONS_GEMINI_BASE_URL lub AI_INTEGRATIONS_GEMINI_API_KEY nie jest skonfigurowane.",
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      apiVersion: "",
      baseUrl,
    },
  });
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
