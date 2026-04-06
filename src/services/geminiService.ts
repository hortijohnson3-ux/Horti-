import { GoogleGenAI, Type } from "@google/genai";
import { Signal, SignalType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let apiCooldownUntil = 0;

export async function analyzeBacBoPattern(history: Signal[]): Promise<{
  type: SignalType;
  confidence: number;
  pattern: string;
  instruction: string;
  isFallback?: boolean;
}> {
  const now = Date.now();
  
  // If we are in cooldown, skip the API call and go straight to fallback
  if (now < apiCooldownUntil) {
    console.warn(`API em cooldown. Faltam ${Math.ceil((apiCooldownUntil - now) / 1000)}s. Usando algoritmo local.`);
    return getLocalFallback(history);
  }

  try {
    const historyText = history
      .slice(0, 15)
      .map(s => `${s.type} (${s.status})`)
      .join(", ");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o histórico de rodadas do Bac Bo Brasileiro (Azul/Vermelho/Empate) e forneça o próximo sinal mais provável com base em padrões estatísticos reais.
      
      Histórico Recente: ${historyText}
      
      Regras do Bac Bo:
      - Azul (Player) e Vermelho (Banker) são os principais.
      - Empate (Tie) é raro mas importante para proteção.
      - Procure por quebras de sequências, repetições (padrão 2-2, 3-3, etc) ou tendências de mesa.
      
      Retorne APENAS um JSON no formato:
      {
        "type": "PLAYER" | "BANKER",
        "confidence": número entre 85 e 99,
        "pattern": "Nome curto do padrão detectado (ex: Quebra de Sequência, Repetição Tripla, etc)",
        "instruction": "Instrução curta de entrada (ex: 'Entrar após a cor Azul' ou 'Entrar após a cor Vermelha')"
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["PLAYER", "BANKER"] },
            confidence: { type: Type.NUMBER },
            pattern: { type: Type.STRING },
            instruction: { type: Type.STRING }
          },
          required: ["type", "confidence", "pattern", "instruction"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      type: result.type as SignalType,
      confidence: result.confidence || 90,
      pattern: result.pattern || "Análise de Tendência",
      instruction: result.instruction || (result.type === 'PLAYER' ? "Entrar após a cor Vermelha" : "Entrar após a cor Azul"),
      isFallback: false
    };
  } catch (error: any) {
    // Check for quota error (429)
    const isQuotaError = error?.error?.code === 429 || error?.status === "RESOURCE_EXHAUSTED" || JSON.stringify(error).includes("429");
    
    if (isQuotaError) {
      console.warn("Cota do Gemini excedida. Ativando cooldown de 2 minutos.");
      apiCooldownUntil = Date.now() + (2 * 60 * 1000); // 2 minutes cooldown
    } else {
      console.error("Erro na análise da IA:", error);
    }
    
    return getLocalFallback(history);
  }
}

function getLocalFallback(history: Signal[]) {
  // Local fallback algorithm (Contingency Algorithm)
  const lastResults = history.slice(0, 5).map(s => s.type);
  let predictedType: SignalType = "PLAYER";
  let patternName = "Algoritmo de Contingência";
  
  if (lastResults.length >= 3) {
    // Simple pattern detection
    const allSame = lastResults.slice(0, 3).every(v => v === lastResults[0]);
    if (allSame) {
      // If 3 in a row, predict a break
      predictedType = lastResults[0] === "PLAYER" ? "BANKER" : "PLAYER";
      patternName = "Quebra de Sequência (Backup)";
    } else if (lastResults[0] !== lastResults[1] && lastResults[1] !== lastResults[2]) {
      // If alternating, predict continuation of alternation
      predictedType = lastResults[0] === "PLAYER" ? "BANKER" : "PLAYER";
      patternName = "Padrão Alternado (Backup)";
    } else {
      // Default to following the last winner (trend)
      predictedType = lastResults[0] as SignalType;
      patternName = "Seguir Tendência (Backup)";
    }
  }

  return {
    type: predictedType,
    confidence: 85,
    pattern: patternName,
    instruction: predictedType === 'PLAYER' ? "Entrar após a cor Vermelha" : "Entrar após a cor Azul",
    isFallback: true
  };
}
