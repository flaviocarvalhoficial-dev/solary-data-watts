import React from 'react';

export type MascotState =
    | 'normal'
    | 'feliz'
    | 'celebrando'
    | 'doente'
    | 'dormindo'
    | 'assustado'
    | 'saudando';

interface WattsMascotProps {
    state?: MascotState;
    size?: number | string;
    className?: string;
    floated?: boolean;
}

const WattsMascot: React.FC<WattsMascotProps> = ({
    state = 'normal',
    size = 120,
    className = "",
    floated = false
}) => {
    // Mapeamento dos arquivos SVG localizados em src/Mascote Watss
    const mascotMap: Record<MascotState, string> = {
        normal: '/src/Mascote%20Watss/normal.svg',
        feliz: '/src/Mascote%20Watss/feliz.svg',
        celebrando: '/src/Mascote%20Watss/celebrando.svg',
        doente: '/src/Mascote%20Watss/doente.svg',
        dormindo: '/src/Mascote%20Watss/dormindo.svg',
        assustado: '/src/Mascote%20Watss/assustado.svg',
        saudando: '/src/Mascote%20Watss/saudando.svg',
    };

    const src = mascotMap[state] || mascotMap.normal;

    const width = typeof size === 'number' ? `${size}px` : size;

    if (floated) {
        return (
            <div
                className={`watts-mascot-floated ${className}`}
                style={{
                    position: 'fixed',
                    bottom: '16px',
                    right: '16px',
                    width: width,
                    height: 'auto',
                    zIndex: 99999,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <img
                    src={src}
                    alt="Watts Mascot Assistant"
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))'
                    }}
                    draggable={false}
                />
            </div>
        );
    }

    return (
        <div
            className={`watts-mascot-container ${className}`}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: width,
                height: width, // Square container for consistency
                overflow: 'hidden'
            }}
        >
            <img
                src={src}
                alt={`Watts Mascote - ${state}`}
                style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain'
                }}
                draggable={false}
            />
        </div>
    );
};

export default WattsMascot;
