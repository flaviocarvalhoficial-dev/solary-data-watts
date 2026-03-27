import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import WattsMascot, { MascotState } from './WattsMascot';

interface OnboardingViewProps {
    onComplete: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
                    Bem-vindo ao <img src="/logotipooficial.svg" alt="Watts" style={{ height: '42px', marginBottom: '-2px' }} />
                </div>
            ),
            subtitle: "Sua nova plataforma de inteligência operacional para gestão de frotas solares.",
            description: "Vamos configurar seu ambiente em poucos passos para você ter o controle total da sua operação hoje mesmo.",
            mascotState: 'saudando' as MascotState,
            icon: null,
            color: 'var(--color-primary)'
        },
        {
            title: "Monitoramento em Tempo Real",
            subtitle: "Conectamos diretamente com as maiores plataformas do mercado.",
            description: "Integração nativa com APsystems, Sungrow e GoodWe para trazer dados de geração em tempo real para o seu painel.",
            mascotState: 'feliz' as MascotState,
            icon: <img src="/logotipooficial.svg" alt="Watts Logo" style={{ height: '28px' }} />,
            color: 'var(--color-primary)'
        },
        {
            title: "Auditoria Inteligente de Faturas",
            subtitle: "Extração automática de dados de faturas em PDF.",
            description: "Nossa tecnologia extrai automaticamente consumo, tarifa e compensação, eliminando erros de digitação manual.",
            mascotState: 'normal' as MascotState,
            icon: <img src="/logotipooficial.svg" alt="Watts Logo" style={{ height: '28px' }} />,
            color: 'var(--color-primary)'
        },
        {
            title: "Relatórios de Alta Performance",
            subtitle: "Encante seus clientes com transparência e dados.",
            description: "Gere relatórios executivos profissionais prontos para envio com apenas um clique. Rapidez que gera valor.",
            mascotState: 'celebrando' as MascotState,
            icon: <img src="/logotipooficial.svg" alt="Watts Logo" style={{ height: '28px' }} />,
            color: 'var(--color-primary)'
        }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = steps[currentStep];

    return (
        <div className="onboarding-screen" style={{ overflow: 'hidden', padding: '0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
                style={{
                    width: '100%',
                    maxWidth: '1240px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(480px, 1.2fr) 1fr',
                    gap: '64px',
                    padding: '48px',
                    alignItems: 'center',
                    textAlign: 'left'
                }}
            >
                {/* Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', textAlign: 'left', maxWidth: '650px' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', animation: 'fadeInLeft 0.5s ease-out forwards' }}>
                        {/* Area de Branding / Iconbox isolada */}
                        {step.icon && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                marginBottom: '32px'
                            }}>
                                {step.icon}
                            </div>
                        )}

                        {/* Bloco de Título e Subtítulo */}
                        <div style={{ marginBottom: '24px' }}>
                            <h1 style={{
                                fontSize: '44px',
                                fontWeight: 800,
                                color: 'var(--color-text-primary)',
                                lineHeight: '1.15',
                                textAlign: 'left',
                                marginBottom: '12px',
                                textWrap: 'pretty' as any
                            }}>
                                {step.title}
                            </h1>

                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 600,
                                color: step.color,
                                textAlign: 'left',
                                lineHeight: '1.4',
                                textWrap: 'pretty' as any
                            }}>
                                {step.subtitle}
                            </h2>
                        </div>

                        {/* Bloco de Descrição */}
                        <p style={{
                            fontSize: '15.5px',
                            lineHeight: '1.7',
                            color: 'var(--color-text-secondary)',
                            maxWidth: '600px',
                            textAlign: 'left',
                            fontWeight: 400,
                            opacity: 0.7,
                            textWrap: 'pretty' as any
                        }}>
                            {step.description}
                        </p>
                    </div>

                    {/* Controles de Navegação */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {currentStep > 0 && (
                            <button
                                className="btn"
                                onClick={prevStep}
                                style={{
                                    padding: '14px 20px',
                                    borderRadius: '14px',
                                    fontWeight: 600,
                                    fontSize: '15px',
                                    color: 'var(--color-text-muted)',
                                    background: 'transparent',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <ChevronLeft size={18} /> Voltar
                            </button>
                        )}

                        <button
                            className={currentStep === steps.length - 1 ? "btn btn-primary" : "btn"}
                            style={{
                                padding: '14px 40px',
                                fontSize: '16px',
                                borderRadius: '14px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: currentStep === steps.length - 1 ? step.color : '#fff',
                                border: `1.5px solid ${step.color}`,
                                color: currentStep === steps.length - 1 ? '#fff' : step.color,
                                boxShadow: currentStep === steps.length - 1 ? `0 8px 16px ${step.color}30` : '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                            onClick={nextStep}
                        >
                            {currentStep === steps.length - 1 ? 'Começar Agora' : 'Continuar'}
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Footer Indicators */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                onClick={() => setCurrentStep(i)}
                                style={{
                                    width: currentStep === i ? '40px' : '10px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: currentStep === i ? step.color : 'var(--color-border)',
                                    opacity: currentStep === i ? 1 : 0.6,
                                    border: currentStep === i ? 'none' : '1px solid var(--color-border)',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    cursor: 'pointer',
                                    boxShadow: currentStep === i ? `0 2px 8px ${step.color}40` : 'none'
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Visual Area - Mascot */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    animation: 'float 6s ease-in-out infinite'
                }}>
                    <div style={{
                        position: 'relative',
                        width: '600px',
                        height: '600px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Soft Glow Background */}
                        <div style={{
                            position: 'absolute',
                            width: '450px',
                            height: '450px',
                            borderRadius: '50%',
                            background: step.color,
                            filter: 'blur(110px)',
                            opacity: 0.12,
                            transition: 'all 0.5s ease'
                        }} />

                        <WattsMascot
                            key={step.mascotState}
                            state={step.mascotState}
                            size={600}
                            className="mascot-transition"
                        />
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes fadeInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .mascot-transition {
                    animation: mascotFadeIn 0.8s ease-out forwards;
                }
                @keyframes mascotFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .onboarding-screen {
                    background: radial-gradient(circle at top right, rgba(232, 89, 60, 0.08), transparent 45%),
                                radial-gradient(circle at bottom left, rgba(99, 102, 241, 0.05), transparent 45%),
                                linear-gradient(rgba(0, 0, 0, 0.015) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0, 0, 0, 0.015) 1px, transparent 1px),
                                var(--color-bg-base);
                    background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px, 100% 100%;
                    height: 100vh;
                    width: 100vw;
                    cursor: default;
                }
            `}</style>
        </div>
    );
};

export default OnboardingView;
