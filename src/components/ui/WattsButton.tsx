import React from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';

interface WattsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
}

const WattsButton: React.FC<WattsButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    fullWidth,
    className = "",
    style,
    disabled,
    ...props
}) => {
    const getVariantStyles = (): React.CSSProperties => {
        switch (variant) {
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    boxShadow: 'none'
                };
            case 'danger':
                return {
                    backgroundColor: 'var(--color-status-danger-bg)',
                    border: 'none',
                    color: 'var(--color-status-danger-text)',
                };
            case 'success':
                return {
                    backgroundColor: 'var(--color-status-success-bg)',
                    border: 'none',
                    color: 'var(--color-status-success-text)',
                };
            case 'link':
                return {
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary)',
                    padding: 0,
                    boxShadow: 'none',
                    textDecoration: 'underline'
                };
            case 'primary':
            default:
                return {
                    backgroundColor: 'var(--color-primary)',
                    border: 'none',
                    color: 'var(--color-text-on-primary)',
                };
        }
    };

    const getSizeStyles = (): React.CSSProperties => {
        switch (size) {
            case 'sm':
                return { padding: '6px 12px', fontSize: '12px' };
            case 'lg':
                return { padding: '12px 24px', fontSize: '15px' };
            case 'md':
            default:
                return { padding: '8px 16px', fontSize: '13px' };
        }
    };

    const baseStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: 'var(--radius-btn)',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled || loading ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
    };

    return (
        <button
            className={`btn ${className}`}
            style={baseStyle}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className="spin" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />}
            {!loading && icon}
            {children}
        </button>
    );
};

export default WattsButton;
