import { GoogleGenAI, Type } from "@google/genai";
import type { ValuationFormData, ValuationResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const { propertyType, area, bedrooms, suites, bathrooms, parkingSpaces, address, conservationState } = formData;

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

        Baseie sua análise em dados de mercado simulados, considerando localização, características do imóvel e tendências atuais. 
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