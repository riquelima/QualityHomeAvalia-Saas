import React from 'react';
import { Icon } from './Icon';
import { ICONS } from './constants';

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-primary-light/20 dark:bg-primary-hover/20 rounded-full mb-4">
            <Icon path={icon} className="w-6 h-6 text-primary dark:text-primary-light" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-primary-text dark:text-white">{title}</h3>
        <p className="text-secondary-text dark:text-slate-300">{description}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; }> = ({ quote, author, role }) => (
    <div className="bg-primary/5 dark:bg-slate-800 p-8 rounded-lg">
        <Icon path={ICONS.quote} className="w-8 h-8 text-primary-light mb-4" />
        <blockquote className="text-primary-text dark:text-slate-200 italic">"{quote}"</blockquote>
        <footer className="mt-4">
            <p className="font-bold text-primary-text dark:text-white">{author}</p>
            <p className="text-sm text-secondary-text">{role}</p>
        </footer>
    </div>
);

export const TrustSection: React.FC = () => {
    return (
        <section className="py-20 bg-light-bg dark:bg-dark-bg">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-white">Confiança e Precisão para Profissionais</h2>
                    <p className="mt-4 text-lg text-secondary-text max-w-3xl mx-auto">Nossa plataforma é construída sobre uma base de dados robusta e tecnologia de ponta para garantir avaliações confiáveis.</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    <FeatureCard
                        icon={ICONS.shield}
                        title="Segurança e Certificações"
                        description="Dados protegidos com criptografia de ponta a ponta e em conformidade com as normas de segurança."
                    />
                    <FeatureCard
                        icon={ICONS.database}
                        title="Tecnologia SINAPI/FIPE"
                        description="Integração com as principais bases de dados do mercado para uma análise comparativa precisa."
                    />
                    <FeatureCard
                        icon={ICONS.chart}
                        title="Análise Preditiva por IA"
                        description="Nossos algoritmos de machine learning identificam tendências e preveem a valorização do imóvel."
                    />
                </div>
                
                <div className="text-center mb-12">
                     <h2 className="text-3xl md:text-4xl font-bold text-primary-text dark:text-white">O que nossos parceiros dizem</h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <TestimonialCard 
                        quote="A Quality Home Avalia transformou minha prospecção. Consigo apresentar relatórios de valor de mercado com uma precisão que impressiona os clientes."
                        author="Carlos Mendes"
                        role="Corretor de Imóveis, São Paulo"
                    />
                    <TestimonialCard 
                        quote="A velocidade e a confiabilidade da plataforma são incomparáveis. É uma ferramenta indispensável no meu dia a dia."
                        author="Juliana Costa"
                        role="Consultora Imobiliária, Rio de Janeiro"
                    />
                </div>
            </div>
        </section>
    );
};