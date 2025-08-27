import React, { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { ICONS } from './constants';
import type { User } from '../types';

declare global {
    interface Window {
        google: any;
    }
}

interface GoogleJwtPayload {
    name: string;
    email: string;
    picture: string;
}

function decodeJwt(token: string): GoogleJwtPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

interface AuthModalProps {
    onClose: () => void;
    onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (typeof window.google === 'undefined' || !googleButtonRef.current || hasInitialized.current) {
            return;
        }

        hasInitialized.current = true;

        window.google.accounts.id.initialize({
            // ATENÇÃO: Substitua pelo seu ID de Cliente real do Google Cloud.
            client_id: '56933567945-8r15nouq3el7mhrhg0gk2bufusmf4ktm.apps.googleusercontent.com',
            callback: (response: any) => {
                const userObject: GoogleJwtPayload = decodeJwt(response.credential);
                onLoginSuccess({
                    name: userObject.name,
                    email: userObject.email,
                    picture: userObject.picture,
                });
            },
        });

        window.google.accounts.id.renderButton(
            googleButtonRef.current,
            { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', shape: 'rectangular' }
        );
    }, [onLoginSuccess]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 text-center">
                     <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-primary">Login ou Cadastro</h2>
                         <button onClick={onClose} className="text-secondary-text hover:text-primary-text">
                            <Icon path={ICONS.close} className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-secondary-text mb-8">Para continuar e ver sua avaliação, por favor, acesse sua conta.</p>

                    <div ref={googleButtonRef} className="flex justify-center my-4"></div>
                    
                    <p className="text-xs text-gray-400 mt-8">
                        Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
                    </p>
                </div>
            </div>
        </div>
    );
};