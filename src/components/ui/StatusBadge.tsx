import React from 'react';

export type StatusType =
    | 'Completo'
    | 'Divergente'
    | 'Incompleto'
    | 'Ativa'
    | 'Inativa'
    | 'Atenção'
    | 'Erro'
    | 'Normal'
    | string;

interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    className?: string;
    style?: React.CSSProperties;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = "", style }) => {
    const getStatusConfig = (s: string) => {
        const normalized = s.toLowerCase();

        if (normalized === 'completo' || normalized === 'ativa' || normalized === 'normal') {
            return {
                bg: 'var(--color-status-success-bg)',
                color: 'var(--color-status-success-text)',
                dot: 'var(--color-status-success-text)'
            };
        }
        if (normalized === 'divergente' || normalized === 'atenção') {
            return {
                bg: 'var(--color-status-warning-bg)',
                color: 'var(--color-status-warning-text)',
                dot: 'var(--color-status-warning-text)'
            };
        }
        if (normalized === 'incompleto' || normalized === 'erro' || normalized === 'inativa') {
            return {
                bg: 'var(--color-status-danger-bg)',
                color: 'var(--color-status-danger-text)',
                dot: 'var(--color-status-danger-text)'
            };
        }

        // Default
        return {
            bg: 'var(--color-bg-base)',
            color: 'var(--color-text-secondary)',
            dot: 'var(--color-text-muted)'
        };
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`badge ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: config.bg,
                color: config.color,
                whiteSpace: 'nowrap',
                ...style
            }}
        >
            <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: config.dot
            }} />
            {label || status}
        </span>
    );
};

export default StatusBadge;
