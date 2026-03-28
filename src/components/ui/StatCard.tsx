import React from 'react';
import { ChevronRight } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    subLabel?: string;
    trend?: {
        label: string;
        type: 'success' | 'warning' | 'danger';
    };
    icon?: React.ReactNode;
    chart?: React.ReactNode;
    chartPosition?: 'right' | 'bottom';
    onClickDetail?: () => void;
    tooltip?: string;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subLabel,
    trend,
    icon,
    chart,
    chartPosition = 'right',
    onClickDetail,
    tooltip,
    color,
    className = "",
    style
}) => {
    return (
        <div
            className={`card ${className}`}
            data-tooltip={tooltip}
            style={{
                padding: '24px',
                position: 'relative',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                ...style
            }}
        >
            <div style={{ flex: 1, position: 'relative', zIndex: 2, maxWidth: (chart && chartPosition === 'right') ? '55%' : '100%' }}>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {label}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: color || 'var(--color-text-primary)', marginBottom: '4px', whiteSpace: chartPosition === 'bottom' ? 'nowrap' : 'normal' }}>
                    {value}
                </div>
                {subLabel && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{subLabel}</div>
                )}

                {chart && chartPosition === 'bottom' && (
                    <div style={{ marginTop: '16px', width: '100%' }}>
                        {chart}
                    </div>
                )}

                {trend && (
                    <div style={{ marginTop: '12px' }}>
                        <span className={`badge badge-${trend.type}`} style={{ fontSize: '11px', padding: '4px 10px' }}>
                            {trend.label}
                        </span>
                    </div>
                )}
            </div>

            {chart && chartPosition === 'right' && (
                <div style={{ position: 'absolute', right: '16px', top: '24px', bottom: '56px', width: '40%', pointerEvents: 'none' }}>
                    {chart}
                </div>
            )}

            {!chart && icon && (
                <div style={{ position: 'absolute', right: '16px', top: '24px', bottom: '56px', width: '40%', opacity: 0.1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
            )}

            {onClickDetail && (
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' }}>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClickDetail(); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '12px',
                            color: 'var(--color-text-secondary)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                        }}
                        className="btn-hover-subtle"
                    >
                        Ver Detalhes <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default StatCard;
