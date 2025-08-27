
import React from 'react';

interface Step {
    id: number;
    title: string;
}

interface ProgressStepperProps {
    steps: Step[];
    currentStep: number;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ steps, currentStep }) => {
    return (
        <div className="flex items-start justify-center max-w-2xl mx-auto">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center text-center w-32">
                        <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold transition-colors duration-300 ${
                                currentStep >= step.id ? 'bg-primary' : 'bg-gray-300'
                            }`}
                        >
                            {step.id}
                        </div>
                         <p className={`mt-2 text-sm font-semibold ${currentStep >= step.id ? 'text-primary' : 'text-secondary-text'}`}>{step.title}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-auto h-0.5 mt-4 transition-colors duration-300 ${
                            currentStep > index + 1 ? 'bg-primary' : 'bg-gray-300'
                        }`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};