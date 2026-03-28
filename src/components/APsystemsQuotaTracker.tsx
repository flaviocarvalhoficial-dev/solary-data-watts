import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface QuotaData {
    month_year: string;
    call_count: number;
    limit: number;
}

const APsystemsQuotaTracker: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
    const [quota, setQuota] = useState<QuotaData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchQuota = async () => {
        const currentMonth = new Date().toISOString().substring(0, 7);
        try {
            const { data, error } = await supabase
                .from('apsystems_monthly_quota')
                .select('month_year, call_count')
                .eq('month_year', currentMonth)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;

            setQuota({
                month_year: currentMonth,
                call_count: data?.call_count || 0,
                limit: 1000
            });
        } catch (err) {
            console.error('Error fetching quota:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuota();
        // Refresh every 5 minutes or when requested
        const interval = setInterval(fetchQuota, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !quota) return null;

    const percentage = Math.min((quota.call_count / quota.limit) * 100, 100);
    const isHigh = percentage > 80;
    const isCritical = percentage > 95;

    if (isCollapsed) {
        return (
            <div
                title={`Quota: ${quota.call_count}/${quota.limit}`}
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isCritical ? 'var(--color-status-danger-muted)' : 'var(--color-bg-sidebar-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCritical ? 'var(--color-status-danger-text)' : 'var(--color-primary)',
                    margin: '8px 0',
                    cursor: 'help',
                    border: isCritical ? '1px solid var(--color-status-danger-text)' : 'none'
                }}
            >
                <Activity size={16} />
            </div>
        );
    }

    return (
        <div style={{
            padding: '12px',
            background: 'var(--color-bg-sidebar-hover)',
            borderRadius: '12px',
            margin: '8px 4px',
            border: '1px solid var(--color-border)',
            fontSize: '11px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={12} color={isCritical ? 'var(--color-status-danger-text)' : 'currentColor'} />
                    <span>Quota APsystems</span>
                </div>
                <span style={{ color: isCritical ? 'var(--color-status-danger-text)' : 'var(--color-text-muted)' }}>
                    {quota.call_count}/{quota.limit}
                </span>
            </div>

            <div style={{
                height: '4px',
                background: 'var(--color-border)',
                borderRadius: '2px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: isCritical ? 'var(--color-status-danger-text)' : isHigh ? '#FBBF24' : 'var(--color-primary)',
                    transition: 'width 1s ease-in-out'
                }} />
            </div>

            <div style={{ marginTop: '6px', color: 'var(--color-text-muted)', fontSize: '10px', opacity: 0.8 }}>
                {isCritical ? 'Limite Crítico!' : isHigh ? 'Aprox. do limite' : 'Consumo saudável'}
            </div>
        </div>
    );
};

export default APsystemsQuotaTracker;
