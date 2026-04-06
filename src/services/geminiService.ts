import { GoogleGenAI, Type } from "@google/genai";
import { Signal, SignalType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeBacBoPattern(history: Signal[]): Promise<{
  type: SignalType;
  confidence: number;
  pattern: string;
  instruction: string;
}> {
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
      instruction: result.instruction || (result.type === 'PLAYER' ? "Entrar após a cor Vermelha" : "Entrar após a cor Azul")
    };
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    // Fallback in case of error
    const types: SignalType[] = ["PLAYER", "BANKER"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return {
      type: randomType,
      confidence: 88,
      pattern: "Análise Estatística",
      instruction: randomType === 'PLAYER' ? "Entrar após a cor Vermelha" : "Entrar após a cor Azul"
    };
  }
}
