import React, { useState, useEffect, useRef } from 'react';
import type { ValuationFormData } from '../types';
import { ProgressStepper } from './ProgressStepper';
import { Icon } from './Icon';
import { ICONS } from './constants';
import { brazilStates, citiesByState } from './brazil-location-data';

declare const L: any;

interface ValuationFormProps {
    onEvaluate: (formData: ValuationFormData) => void;
    isLoading: boolean;
    onFocusChange?: (isFocused: boolean) => void;
}

type FormData = Omit<ValuationFormData, "area" | "bedrooms" | "suites" | "bathrooms" | "parkingSpaces"> & {
    area: string;
    bedrooms: string;
    suites: string;
    bathrooms: string;
    parkingSpaces: string;
};

const formSteps = [
    { id: 1, title: 'Insira a localização' },
    { id: 2, title: 'Tipo de imóvel' },
    { id: 3, title: 'Preencha suas características' },
];

const PropertyTypeCard: React.FC<{ icon: keyof typeof ICONS; label: string; selected: boolean; onClick: () => void; }> = ({ icon, label, selected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`border-2 rounded-lg p-6 flex flex-col items-center justify-center transition-all duration-200 ${selected ? 'border-primary-red bg-primary-light' : 'border-medium-border hover:border-primary-red hover:bg-gray-50'}`}
    >
        <Icon path={ICONS[icon]} className="w-16 h-16 mb-4 text-primary-red" />
        <span className="font-semibold text-primary-text">{label}</span>
    </button>
);

export const ValuationForm: React.FC<ValuationFormProps> = ({ onEvaluate, isLoading, onFocusChange }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        address: '',
        propertyType: 'apartamento',
        area: '',
        bedrooms: '',
        suites: '',
        bathrooms: '',
        parkingSpaces: '',
        conservationState: 'bom',
    });
    const [selectedState, setSelectedState] = useState('');
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [isLocating, setIsLocating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any | null>(null);
    const markerInstance = useRef<any | null>(null);

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const stateCode = e.target.value;
        setSelectedState(stateCode);
        setSelectedCity('');
        const newCities = stateCode ? citiesByState[stateCode] || [] : [];
        setCities(newCities);
        setFormData(prev => ({ ...prev, address: '' }));
    };

    const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityName = e.target.value;
        setSelectedCity(cityName);
        if (cityName && selectedState) {
            const stateName = brazilStates.find(s => s.code === selectedState)?.name;
            setIsLocating(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&city=${cityName}&state=${stateName}&country=Brazil&limit=1&countrycodes=br`);
                const data = await response.json();
                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
                    mapInstance.current?.setView(coords, 14);
                    markerInstance.current?.setLatLng(coords);
                    setFormData(prev => ({...prev, address: `${cityName}, ${stateName}, Brasil`}));
                }
            } catch (error) {
                console.error("Error geocoding city:", error);
            } finally {
                setIsLocating(false);
            }
        }
    };
    
    const syncDropdownsFromLocation = (locationData: any) => {
        const { address } = locationData;
        const stateNameFromApi = address.state;
        const cityNameFromApi = address.city || address.town || address.village;

        if (stateNameFromApi) {
            const foundState = brazilStates.find(s => s.name.toLowerCase() === stateNameFromApi.toLowerCase());
            if (foundState) {
                setSelectedState(foundState.code);
                const newCities = citiesByState[foundState.code] || [];
                setCities(newCities);
                if (cityNameFromApi && newCities.some(c => c.toLowerCase() === cityNameFromApi.toLowerCase())) {
                    setSelectedCity(cityNameFromApi);
                } else {
                    setSelectedCity('');
                }
            }
        }
    }


    useEffect(() => {
        if (mapRef.current && !mapInstance.current) {
            const initialCoords: [number, number] = [-12.5797, -41.7007]; 
            mapInstance.current = L.map(mapRef.current).setView(initialCoords, 7);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);

            markerInstance.current = L.marker(initialCoords, {
                draggable: true,
            }).addTo(mapInstance.current);

            markerInstance.current.on('dragend', async (event: any) => {
                const marker = event.target;
                const position = marker.getLatLng();
                setIsLocating(true);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&addressdetails=1&countrycodes=br`);
                    const data = await response.json();
                    if (data && data.display_name) {
                        setFormData(prev => ({ ...prev, address: data.display_name }));
                        syncDropdownsFromLocation(data);
                    }
                } catch (error) {
                    console.error("Error reverse geocoding:", error);
                } finally {
                    setIsLocating(false);
                }
            });
        }
    }, []);

    const handleLocate = async () => {
        if (!formData.address.trim()) return;
        setIsLocating(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&countrycodes=br&addressdetails=1&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
                mapInstance.current?.setView(coords, 16);
                markerInstance.current?.setLatLng(coords);
                setFormData(prev => ({ ...prev, address: data[0].display_name }));
                syncDropdownsFromLocation(data[0]);
            } else {
                alert("Endereço não encontrado.");
            }
        } catch (error) {
            console.error("Error locating address:", error);
            alert("Ocorreu um erro ao localizar o endereço.");
        } finally {
            setIsLocating(false);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateStep = () => {
        const newErrors: Record<string, string> = {};
        if (currentStep === 1) {
            if (!formData.address.trim()) newErrors.address = 'O endereço é obrigatório.';
        }
        if (currentStep === 3) {
            if (!formData.area || parseFloat(formData.area) <= 0) newErrors.area = 'Área inválida.';
            if (!formData.bedrooms || parseInt(formData.bedrooms) < 0) newErrors.bedrooms = 'Número inválido.';
            if (!formData.suites || parseInt(formData.suites) < 0) newErrors.suites = 'Número inválido.';
            if (!formData.bathrooms || parseInt(formData.bathrooms) < 0) newErrors.bathrooms = 'Número inválido.';
            if (!formData.parkingSpaces || parseInt(formData.parkingSpaces) < 0) newErrors.parkingSpaces = 'Número inválido.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleNext = () => {
        if (validateStep()) {
            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
            }
        }
    };
    
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep()) {
            const finalData: ValuationFormData = {
                ...formData,
                area: parseFloat(formData.area),
                bedrooms: parseInt(formData.bedrooms),
                suites: parseInt(formData.suites),
                bathrooms: parseInt(formData.bathrooms),
                parkingSpaces: parseInt(formData.parkingSpaces),
            };
            onEvaluate(finalData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto" onFocus={() => onFocusChange?.(true)} onBlur={() => onFocusChange?.(false)}>
            <div className="mb-8">
                <ProgressStepper steps={formSteps} currentStep={currentStep} />
            </div>
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md border border-medium-border min-h-[400px]">
                {currentStep === 1 && (
                    <div className="fade-in-up">
                        <h2 className="text-xl font-bold text-primary-text mb-6 text-center">Ingresse a localização</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                           <div>
                                <label className="block text-sm font-medium text-secondary-text mb-1">País</label>
                                <input type="text" value="Brasil" readOnly className="w-full p-2 border border-medium-border rounded-md bg-slate-100 cursor-not-allowed" />
                           </div>
                           <div>
                                <label htmlFor="state" className="block text-sm font-medium text-secondary-text mb-1">Estado</label>
                                <select id="state" value={selectedState} onChange={handleStateChange} className="w-full p-2 border border-medium-border rounded-md bg-white">
                                    <option value="">Selecione um estado</option>
                                    {brazilStates.map(state => (
                                        <option key={state.code} value={state.code}>{state.name}</option>
                                    ))}
                                </select>
                           </div>
                           <div className="md:col-span-2">
                                <label htmlFor="city" className="block text-sm font-medium text-secondary-text mb-1">Cidade</label>
                                <select id="city" value={selectedCity} onChange={handleCityChange} disabled={!selectedState} className="w-full p-2 border border-medium-border rounded-md bg-white disabled:bg-slate-100">
                                    <option value="">Selecione uma cidade</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                           </div>
                        </div>
                        <div className="mb-4">
                             <label htmlFor="address" className="block text-sm font-medium text-secondary-text mb-1">Endereço do imóvel</label>
                            <input 
                                type="text" 
                                id="address" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-medium-border'}`} 
                                placeholder="Digite o endereço completo ou ajuste no mapa"
                            />
                             {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                        </div>

                        <button type="button" onClick={handleLocate} disabled={isLocating} className="w-full bg-primary-red hover:bg-primary-red-hover text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center disabled:bg-red-300 mb-4">
                            {isLocating ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Localizando...
                                </>
                            ) : (
                               'Localizar'
                            )}
                        </button>

                        <div ref={mapRef} className="h-64 md:h-80 w-full rounded-md border border-medium-border"></div>
                    </div>
                )}
                {currentStep === 2 && (
                    <div className="fade-in-up">
                        <h2 className="text-xl font-bold text-primary-text mb-6 text-center">Tipo de imóvel</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <PropertyTypeCard icon="apartment" label="Apartamento" selected={formData.propertyType === 'apartamento'} onClick={() => setFormData(prev => ({ ...prev, propertyType: 'apartamento' }))}/>
                            <PropertyTypeCard icon="house" label="Casa" selected={formData.propertyType === 'casa'} onClick={() => setFormData(prev => ({ ...prev, propertyType: 'casa' }))}/>
                            <PropertyTypeCard icon="local" label="Comercial" selected={formData.propertyType === 'local'} onClick={() => setFormData(prev => ({ ...prev, propertyType: 'local' }))}/>
                        </div>
                    </div>
                )}
                {currentStep === 3 && (
                    <div className="fade-in-up">
                         <h2 className="text-xl font-bold text-primary-text mb-6 text-center">Características do imóvel</h2>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="area" className="block text-sm font-medium text-secondary-text mb-1">Área (m²)</label>
                                <input type="number" id="area" name="area" value={formData.area} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.area ? 'border-red-500' : 'border-medium-border'}`} placeholder="Área construída ou terreno" />
                                {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                            </div>
                            <div>
                                <label htmlFor="bedrooms" className="block text-sm font-medium text-secondary-text mb-1">Nº de quartos</label>
                                <input type="number" id="bedrooms" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.bedrooms ? 'border-red-500' : 'border-medium-border'}`} />
                                {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
                            </div>
                            <div>
                                <label htmlFor="suites" className="block text-sm font-medium text-secondary-text mb-1">Nº de suítes</label>
                                <input type="number" id="suites" name="suites" value={formData.suites} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.suites ? 'border-red-500' : 'border-medium-border'}`} />
                                {errors.suites && <p className="text-red-500 text-sm mt-1">{errors.suites}</p>}
                            </div>
                            <div>
                                <label htmlFor="bathrooms" className="block text-sm font-medium text-secondary-text mb-1">Nº de banheiros</label>
                                <input type="number" id="bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.bathrooms ? 'border-red-500' : 'border-medium-border'}`} />
                                {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
                            </div>
                            <div>
                                <label htmlFor="parkingSpaces" className="block text-sm font-medium text-secondary-text mb-1">Nº de vagas</label>
                                <input type="number" id="parkingSpaces" name="parkingSpaces" value={formData.parkingSpaces} onChange={handleChange} className={`w-full p-2 border rounded-md ${errors.parkingSpaces ? 'border-red-500' : 'border-medium-border'}`} />
                                {errors.parkingSpaces && <p className="text-red-500 text-sm mt-1">{errors.parkingSpaces}</p>}
                            </div>
                             <div>
                                <label htmlFor="conservationState" className="block text-sm font-medium text-secondary-text mb-1">Estado de conservação</label>
                                <select id="conservationState" name="conservationState" value={formData.conservationState} onChange={handleChange} className="w-full p-2 border border-medium-border rounded-md bg-white">
                                    <option value="bom">Bom</option>
                                    <option value="regular">Regular</option>
                                    <option value="ruim">Ruim</option>
                                </select>
                            </div>
                         </div>
                    </div>
                )}
            </div>
            
            <div className="mt-8 flex justify-between items-center">
                <button 
                    type="button" 
                    onClick={handleBack} 
                    className={`px-6 py-2 rounded-md font-semibold transition-opacity ${currentStep === 1 ? 'opacity-0 cursor-default' : 'opacity-100 border border-medium-border hover:bg-slate-100'}`}
                    disabled={currentStep === 1}
                >
                    Voltar
                </button>
                {currentStep < 3 ? (
                    <button type="button" onClick={handleNext} className="px-6 py-2 bg-primary-red hover:bg-primary-red-hover text-white font-semibold rounded-md shadow-md">
                        Avançar
                    </button>
                ) : (
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-primary-red hover:bg-primary-red-hover text-white font-semibold rounded-md shadow-md flex items-center justify-center disabled:bg-red-300 w-36">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                 Avaliando...
                            </>
                        ) : (
                            'Calcular Agora'
                        )}
                    </button>
                )}
            </div>
        </form>
    );
};