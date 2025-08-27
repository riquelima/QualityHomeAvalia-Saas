
export interface ValuationFormData {
    propertyType: 'apartamento' | 'casa' | 'local';
    area: number;
    bedrooms: number;
    suites: number;
    bathrooms: number;
    parkingSpaces: number;
    address: string;
    conservationState: 'bom' | 'regular' | 'ruim';
    features: string[];
}

export interface ValuationResult {
    estimatedValue: number;
    analysis: string;
    valuePerSqM: number;
    confidenceScore: number;
}

export interface User {
    name: string;
    email: string;
    picture: string;
}

export interface Report {
    id: string;
    date: string;
    formData: ValuationFormData;
    result: ValuationResult;
}