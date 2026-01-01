
import { GoogleGenAI, Type } from "@google/genai";
import { Measurement, Device, AIAnalysis } from "../types";

export const analyzeVoltageData = async (
  measurements: Measurement[],
  devices: Device[]
): Promise<AIAnalysis> => {
  // Initialize with the API key from environment variables.
  // The SDK requires this initialization right before use for consistency.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (!process.env.API_KEY) {
    return {
      summary: "AI analysis is unavailable (API Key missing).",
      anomalies: [],
      recommendations: ["Ensure API key is configured for smart diagnostics."]
    };
  }

  const dataSnapshot = measurements.map(m => {
    const device = devices.find(d => d.id === m.deviceId);
    return `Device: ${device?.name}, Phase A: ${m.phaseA}V, Phase B: ${m.phaseB}V, Phase C: ${m.phaseC}V at ${m.timestamp}`;
  }).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following substation voltage logs for the Fergana region power grid. 
      The standard voltage should be around 220V or 380V depending on the connection. 
      Identify significant imbalances between phases (more than 10% difference) or drops below 90% of nominal value.
      Data:\n${dataSnapshot}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            anomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "anomalies", "recommendations"]
        }
      }
    });

    // Extracting text output from GenerateContentResponse using the .text property.
    const jsonStr = response.text || '{}';
    return JSON.parse(jsonStr) as AIAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Error generating AI analysis.",
      anomalies: [],
      recommendations: ["Check logs for technical details."]
    };
  }
};
