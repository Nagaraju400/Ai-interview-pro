const { GoogleGenAI } = require("@google/genai");

async function run() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy",
  });
  
  // Actually the SDK for listModels might be `ai.models.list()` or something similar
  try {
    const models = await ai.models.list();
    for await (const m of models) {
      console.log(m.name);
    }
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

run().catch(console.error);
