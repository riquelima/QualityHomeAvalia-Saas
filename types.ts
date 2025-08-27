
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

interface PriceValuation {
    max: number;
    min: number;
    estimated: number;
}

interface PointOfInterest {
    type: string;
    count: number;
    description: string;
}

interface SecurityMetric {
    type: string;
    score: number;
    description: string;
}

interface TransactionCost {
    name: string;
    value: number;
    description: string;
}

interface MarketComparison {
    label: string;
    propertyValue: number;
    averageValue: number;
}

export interface ValuationResult {
    city: string;
    generatedDate: string;
    propertyType: string;
    address: string;
    
    salePrice: PriceValuation;
    rentPrice: PriceValuation;
    pricePerSqM: number;

    area: number;
    bedrooms: number;
    bathrooms: number;
    parkingSpaces: number;

    pointsOfInterest: PointOfInterest[];
    securityIndex: {
        overallScore: number;
        metrics: SecurityMetric[];
    };
    transactionCosts: TransactionCost[];
    sectorStatistics: {
        bedrooms: MarketComparison[];
        bathrooms: MarketComparison[];
        parking: MarketComparison[];
    };
    marketTrend: {
        labels: string[]; // e.g., ['Jan', 'Feb', 'Mar']
        salePrices: number[];
        rentPrices: number[];
    };
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