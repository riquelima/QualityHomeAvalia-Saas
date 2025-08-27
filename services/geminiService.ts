import { GoogleGenAI, Type } from "@google/genai";
import type { ValuationFormData, ValuationResult } from '../types';

// NOTE: The API key has been added directly to resolve deployment issues on Vercel.
// For production applications, it's highly recommended to use a backend proxy 
// or serverless functions to keep API keys secure and not expose them on the client-side.
const API_KEY = "AIzaSyCsX9l10XCu3TtSCU1BSx-qOYrwUKYw2xk";

if (!API_KEY) {
    throw new Error("Google AI API Key is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const valuationSchema = {
    type: Type.OBJECT,
    properties: {
        estimatedValue: {
            type: Type.NUMBER,
            description: "The estimated market value of the property in BRL (Brazilian Real). Example: 750000"
        },
        analysis: {
            type: Type.STRING,
            description: "A brief, professional analysis of the valuation, highlighting key factors. Max 100 words."
        },
        valuePerSqM: {
            type: Type.NUMBER,
            description: "The calculated value per square meter for the property in BRL. Example: 8500.50"
        },
        confidenceScore: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 indicating the confidence level of this valuation. Example: 85"
        }
    },
};

export const getValuation = async (formData: ValuationFormData): Promise<ValuationResult> => {
    const { propertyType, area, bedrooms, suites, bathrooms, parkingSpaces, address, conservationState, features } = formData;

    const prompt = `
        Realize uma avaliação imobiliária profissional para a seguinte propriedade no Brasil:
        - Tipo: ${propertyType}
        - Área: ${area} m²
        - Quartos: ${bedrooms}
        - Suítes: ${suites}
        - Banheiros: ${bathrooms}
        - Vagas de Garagem: ${parkingSpaces}
        - Estado de Conservação: ${conservationState}
        - Endereço (referência): ${address}
        - Outras Características: ${features.length > 0 ? features.join(', ') : 'Nenhuma informada'}

        Baseie sua análise em dados de mercado simulados, considerando localização, características do imóvel e tendências atuais. 
        Leve em consideração as 'Outras Características' para ajustar o valor final. Por exemplo, uma piscina ou varanda gourmet deve valorizar o imóvel.
        Forneça os resultados estritamente no formato JSON solicitado.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: valuationSchema,
                temperature: 0.2,
            },
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        return result as ValuationResult;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get valuation from AI service.");
    }
};