
import React, { useState, useRef } from 'react';
import { ValuationForm } from './ValuationForm';
import type { ValuationFormData } from '../types';

interface HeroSectionProps {
    onEvaluate: (formData: ValuationFormData) => void;
    isLoading: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onEvaluate, isLoading }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleFormFocus = (isFocused: boolean) => {
        if (videoRef.current) {
            isFocused ? videoRef.current.pause() : videoRef.current.play();
        }
    };

    return (
        <section className="hero-section relative h-screen w-full flex items-center justify-center text-white overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="hero-video absolute top-0 left-0 w-full h-full object-cover z-0"
            >
                <source src="https://cdn.pixabay.com/video/2022/05/04/115980-706323936_large.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="hero-overlay absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/85 to-primary/70 z-10"></div>
            <div className="hero-content container mx-auto px-6 z-20 w-full">
                <div className="grid lg:grid-cols-5 gap-12 items-center">
                    <div className="lg:col-span-3 text-left">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
                            Descubra o valor real do seu imóvel em minutos
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 fade-in-up" style={{ animationDelay: '0.4s' }}>
                           Utilize nossa tecnologia de IA para obter avaliações precisas e instantâneas, baseadas em milhares de pontos de dados do mercado.
                        </p>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="hero-form bg-white/95 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-2xl fade-in-up" style={{ animationDelay: '0.6s' }}>
                           {/* FIX: The `ValuationForm` component expects an `onEvaluate` prop, not `onSubmit`. */}
                           <ValuationForm onEvaluate={onEvaluate} isLoading={isLoading} onFocusChange={handleFormFocus} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};