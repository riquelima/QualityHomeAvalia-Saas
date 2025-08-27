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
        city: { type: Type.STRING, description: "City of the property." },
        generatedDate: { type: Type.STRING, description: "Date of valuation in DD/MM/YYYY format." },
        propertyType: { type: Type.STRING, description: "Type of property (e.g., Apartamento, Casa)." },
        address: { type: Type.STRING, description: "Full address of the property." },
        salePrice: {
            type: Type.OBJECT,
            properties: {
                max: { type: Type.NUMBER, description: "Maximum estimated sale price." },
                min: { type: Type.NUMBER, description: "Minimum estimated sale price." },
                estimated: { type: Type.NUMBER, description: "Most likely estimated sale price." },
            },
        },
        rentPrice: {
            type: Type.OBJECT,
            properties: {
                max: { type: Type.NUMBER, description: "Maximum estimated rent price." },
                min: { type: Type.NUMBER, description: "Minimum estimated rent price." },
                estimated: { type: Type.NUMBER, description: "Most likely estimated rent price." },
            },
        },
        pricePerSqM: { type: Type.NUMBER, description: "Estimated price per square meter." },
        area: { type: Type.NUMBER, description: "Area of the property in square meters." },
        bedrooms: { type: Type.NUMBER, description: "Number of bedrooms." },
        bathrooms: { type: Type.NUMBER, description: "Number of bathrooms." },
        parkingSpaces: { type: Type.NUMBER, description: "Number of parking spaces." },
        pointsOfInterest: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Type of point of interest (e.g., Cinemas, Shopping Centers)." },
                    count: { type: Type.NUMBER, description: "Number of such points nearby." },
                    description: { type: Type.STRING, description: "A brief description." },
                },
            },
        },
        securityIndex: {
            type: Type.OBJECT,
            properties: {
                overallScore: { type: Type.NUMBER, description: "Overall security score from 1 to 100." },
                metrics: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, description: "Type of security metric (e.g., Roubo de bicicleta)." },
                            score: { type: Type.NUMBER, description: "Score for this specific metric (1-100)." },
                            description: { type: Type.STRING, description: "Description (e.g., 'Mais seguro', 'Menos seguro')." },
                        },
                    },
                },
            },
        },
        transactionCosts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the cost (e.g., Processo de registro)." },
                    value: { type: Type.NUMBER, description: "Estimated value of the cost." },
                    description: { type: Type.STRING, description: "Brief description of the cost." },
                },
            },
        },
        sectorStatistics: {
            type: Type.OBJECT,
            properties: {
                bedrooms: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING, description: "Label for the data point (e.g., '1', '2', '3+')." },
                            propertyValue: { type: Type.NUMBER, description: "Percentage for the property's category." },
                            averageValue: { type: Type.NUMBER, description: "Percentage for the market average in this category." },
                        },
                    },
                },
                 bathrooms: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING, description: "Label for the data point (e.g., '1', '2', '3+')." },
                            propertyValue: { type: Type.NUMBER, description: "Percentage for the property's category." },
                            averageValue: { type: Type.NUMBER, description: "Percentage for the market average in this category." },
                        },
                    },
                },
                parking: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: { type: Type.STRING, description: "Label for the data point (e.g., '0', '1', '2+')." },
                            propertyValue: { type: Type.NUMBER, description: "Percentage for the property's category." },
                            averageValue: { type: Type.NUMBER, description: "Percentage for the market average in this category." },
                        },
                    },
                },
            },
        },
        marketTrend: {
            type: Type.OBJECT,
            properties: {
                labels: { type: Type.ARRAY, items: { type: Type.STRING } },
                salePrices: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                rentPrices: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            },
        },
    },
};

export const getValuation = async (formData: ValuationFormData): Promise<ValuationResult> => {
    const { propertyType, area, bedrooms, suites, bathrooms, parkingSpaces, address, conservationState, features } = formData;

    const prompt = `
        Gere um relatório de avaliação imobiliária completo e profissional para a seguinte propriedade no Brasil, usando dados de mercado realistas, porém simulados.
        O relatório deve ser detalhado e seguir estritamente o formato JSON. O objetivo é criar um relatório que se assemelhe ao exemplo da "Red Atlas".

        Dados do Imóvel:
        - Tipo: ${propertyType}
        - Área: ${area} m²
        - Quartos: ${bedrooms}
        - Suítes: ${suites}
        - Banheiros: ${bathrooms}
        - Vagas de Garagem: ${parkingSpaces}
        - Estado de Conservação: ${conservationState}
        - Endereço (referência): ${address}
        - Outras Características: ${features.length > 0 ? features.join(', ') : 'Nenhuma informada'}

        Requisitos para o JSON de saída:
        1.  **Informações Gerais**: Extraia a cidade do endereço, use a data de hoje (DD/MM/YYYY), e repita o tipo de imóvel e o endereço.
        2.  **Análise de Preços**: Forneça valores estimados, mínimos e máximos para VENDA e ALUGUEL. Calcule também o preço por m².
        3.  **Características**: Repita os dados de área, quartos, banheiros e vagas.
        4.  **Pontos de Interesse Próximos**: Simule a quantidade de pontos de interesse como 'Cinemas' e 'Centros Comerciais' nas proximidades.
        5.  **Índice de Segurança**: Crie um índice de segurança geral (1-100) e detalhe-o com métricas simuladas (ex: roubo de bicicleta, roubo residencial), cada uma com sua pontuação (1-100).
        6.  **Custos de Transação**: Simule custos associados à compra, como 'Registro de escritura', 'Impostos', etc., com valores e descrições.
        7.  **Estatísticas do Setor (para gráficos de barras)**: Crie dados comparativos. Para 'Quartos', 'Banheiros' e 'Vagas', forneça uma matriz de objetos. Cada objeto deve ter um 'label' (ex: '1', '2', '3+'), um 'propertyValue' (percentual que o imóvel em questão representa, deve ser alto para a sua categoria) e um 'averageValue' (percentual médio da região). Exemplo para 2 quartos: [{label: '1', propertyValue: 0, averageValue: 20}, {label: '2', propertyValue: 45, av: 50}, {label: '3+', pv: 0, av: 30}]. A soma de 'averageValue' deve ser próxima de 100.
        8.  **Tendências de Mercado (para gráfico de linhas)**: Simule dados para os últimos 6 meses. Forneça uma matriz de 'labels' com os meses (ex: ['Jan', 'Fev',...]) e duas matrizes de 'salePrices' e 'rentPrices' com valores simulados para cada mês.

        Seja criativo e realista com os dados simulados para criar um relatório convincente e valioso. A qualidade e o detalhe dos dados são cruciais.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: valuationSchema,
                temperature: 0.4, // Um pouco mais de criatividade para os dados simulados
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