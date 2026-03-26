import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, Palette, Building2,
    Save, Upload, CheckCircle2, Layout, Type
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BrandingSettings {
    company_name: string;
    primary_color: string;
    secondary_color: string;
    logo_url: string;
    report_footer: string;
}

interface SettingsViewProps {
    user: any;
    branding: BrandingSettings;
    setBranding: (branding: BrandingSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, branding, setBranding }) => {
    const [localBranding, setLocalBranding] = useState<BrandingSettings>(branding);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setLocalBranding(branding);
    }, [branding]);

    const handleSave = async () => {
        setIsSaving(true);
        // Persistir no LocalStorage for now since I can't modify DB schema via API easily
        localStorage.setItem(`solary_branding_${user?.id}`, JSON.stringify(localBranding));

        // Tentar salvar no profiles (se os campos existirem, a API vai aceitar)
        try {
            await supabase.from('profiles').update({
                organization_name: localBranding.company_name,
                // avatar_url: localBranding.logo_url // Usar como logo
            }).eq('id', user.id);
        } catch (e) {
            console.warn('DB profile update failed (likely missing columns), using localStorage as fallback.');
        }

        setBranding(localBranding);
        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limite de 2MB para evitar estouro de localStorage (se usar Base64)
        if (file.size > 2 * 1024 * 1024) {
            return alert('O arquivo é muito grande. Use uma imagem de até 2MB.');
        }

        setIsSaving(true);

        // 1. Tenta Upload oficial via Supabase Storage
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `logo_${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path);

            setLocalBranding(prev => ({ ...prev, logo_url: publicUrl }));
        } catch (err: any) {
            console.warn('Erro no Storage, usando fallback Base64:', err.message);

            // 2. FALLBACK: Converte para Base64 se o Storage falhar
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setLocalBranding(prev => ({ ...prev, logo_url: base64 }));
            };
            reader.readAsDataURL(file);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                <div style={{ padding: '10px', background: 'var(--color-primary)', borderRadius: 'var(--radius-md)', color: '#fff' }}>
                    <SettingsIcon size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Configurações do Sistema</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Personalize sua plataforma e o estilo dos relatórios.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Branding Section */}
                <div className="table-card" style={{ padding: 'var(--space-6)', gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                        <Building2 size={20} color="var(--color-primary)" />
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Identidade Visual (Relatórios)</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>NOME DA EMPRESA / INTEGRADOR</label>
                            <input
                                type="text"
                                className="input-field"
                                value={localBranding.company_name}
                                onChange={e => setLocalBranding(prev => ({ ...prev, company_name: e.target.value }))}
                                placeholder="Ex: Solary Energy Solutions"
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-muted)' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>COR PRINCIPAL (HEX)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="color"
                                    value={localBranding.primary_color}
                                    onChange={e => setLocalBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                                    style={{ width: '42px', height: '42px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    className="input-field"
                                    value={localBranding.primary_color}
                                    onChange={e => setLocalBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontFamily: 'monospace' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>COR SECUNDÁRIA</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="color"
                                    value={localBranding.secondary_color}
                                    onChange={e => setLocalBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                                    style={{ width: '42px', height: '42px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}
                                />
                                <input
                                    type="text"
                                    className="input-field"
                                    value={localBranding.secondary_color}
                                    onChange={e => setLocalBranding(prev => ({ ...prev, secondary_color: e.target.value }))}
                                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontFamily: 'monospace' }}
                                />
                            </div>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>LOGO DA EMPRESA</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--color-bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
                                {localBranding.logo_url ? (
                                    <img src={localBranding.logo_url} alt="Logo preview" style={{ height: '60px', width: 'auto', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ height: '60px', width: '60px', borderRadius: 'var(--radius-sm)', background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                                        <Palette size={24} />
                                    </div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Upload de Logotipo</p>
                                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>PNG ou JPG transparente (Max 2MB). Recomendado 512x512.</p>
                                    <label className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}>
                                        <Upload size={14} /> Alterar Logo
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>RODAPÉ DOS RELATÓRIOS (PDF)</label>
                            <textarea
                                className="input-field"
                                value={localBranding.report_footer}
                                onChange={e => setLocalBranding(prev => ({ ...prev, report_footer: e.target.value }))}
                                rows={2}
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-muted)', resize: 'none', fontSize: '13px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="table-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                        <Layout size={20} color="var(--color-primary)" />
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Perfil do Usuário</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800 }}>
                            {(user?.email || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.email}</p>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Status: Administrador Master</p>
                        </div>
                    </div>
                </div>

                <div className="table-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                        <Type size={20} color="var(--color-primary)" />
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Dicas e Atalhos</h3>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li><strong>Hex Colors:</strong> Refletirão nos gráficos e botões do PDF.</li>
                        <li><strong>Logo:</strong> Procure usar logos com fundo transparente.</li>
                        <li><strong>Batch Mode:</strong> Configurações aplicadas a todos simultaneamente.</li>
                    </ul>
                </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                {showSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 600, fontSize: '14px' }}>
                        <CheckCircle2 size={18} /> Configurações salvas com sucesso!
                    </div>
                )}
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ padding: '12px 32px' }}
                >
                    <Save size={18} /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </div>
    );
};

export default SettingsView;
