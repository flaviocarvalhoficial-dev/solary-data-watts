import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, Palette, Building2,
    Save, Upload, CheckCircle2, User, Camera, Mail,
    AtSign, Briefcase, Trash2, RefreshCw, Lock, ShieldCheck, MapPin, Phone,
    Share2, Zap, LayoutGrid, Globe, ExternalLink, AlertCircle, Plus, Info, Edit2, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import WattsButton from './ui/WattsButton';
import StatusBadge from './ui/StatusBadge';
import { supabase } from '../lib/supabase';

interface BrandingSettings {
    company_name: string;
    primary_color: string;
    secondary_color: string;
    logo_url: string;
    report_footer: string;
}

interface UserSettings {
    full_name: string;
    avatar_url: string;
}

interface ManufacturerBrand {
    id: string;
    name: string;
    icon_letter: string;
    logo_url?: string;
    color: string;
    description: string;
    is_active: boolean;
}

interface SettingsViewProps {
    user: any;
    branding: BrandingSettings;
    setBranding: (branding: BrandingSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, branding, setBranding }) => {
    const [activeTab, setActiveTab] = useState<'user' | 'branding' | 'brands'>('user');
    const [localBranding, setLocalBranding] = useState<BrandingSettings>(branding);
    const [localUser, setLocalUser] = useState<UserSettings>({
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
        avatar_url: user?.user_metadata?.avatar_url || ''
    });

    // Gestão de Fabricantes
    const defaultBrands: ManufacturerBrand[] = [
        { id: 'aps', name: 'APsystems', icon_letter: 'A', color: '#E8593C', description: 'Ativo via Importação XLS e API Watts.', is_active: true },
        { id: 'sungrow', name: 'Sungrow', icon_letter: 'S', color: '#0066FF', description: 'Personalização visual para faturas importadas.', is_active: true },
        { id: 'goodwe', name: 'GoodWe', icon_letter: 'G', color: '#FF9900', description: 'Utilizado no agrupamento de frota e dashboards.', is_active: true }
    ];

    const [brands, setBrands] = useState<ManufacturerBrand[]>(() => {
        const saved = localStorage.getItem(`solary_brands_${user?.id}`);
        return saved ? JSON.parse(saved) : defaultBrands;
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [editingBrand, setEditingBrand] = useState<ManufacturerBrand | null>(null);

    useEffect(() => {
        setLocalBranding(branding);
    }, [branding]);

    const handleSave = async () => {
        setIsSaving(true);
        localStorage.setItem(`solary_branding_${user?.id}`, JSON.stringify(localBranding));
        localStorage.setItem(`solary_brands_${user?.id}`, JSON.stringify(brands));
        setBranding(localBranding);

        try {
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: localUser.full_name, avatar_url: localUser.avatar_url }
            });
            if (authError) throw authError;

            await supabase.from('profiles').update({
                organization_name: localBranding.company_name,
                avatar_url: localUser.avatar_url,
                full_name: localUser.full_name
            }).eq('id', user.id);
        } catch (e: any) { console.error(e); }

        setIsSaving(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'avatar' | 'brand', brandId?: string) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;
        setIsSaving(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${type}_${brandId || ''}_${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;
            const { data, error } = await supabase.storage.from('avatars').upload(filePath, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path);

            if (type === 'logo') setLocalBranding(prev => ({ ...prev, logo_url: publicUrl }));
            else if (type === 'avatar') setLocalUser(prev => ({ ...prev, avatar_url: publicUrl }));
            else if (type === 'brand' && brandId) {
                setBrands(prev => prev.map(b => b.id === brandId ? { ...b, logo_url: publicUrl } : b));
                if (editingBrand?.id === brandId) setEditingBrand(prev => prev ? { ...prev, logo_url: publicUrl } : null);
            }
        } catch (err: any) { alert(`Upload error: ${err.message}`); } finally { setIsSaving(false); }
    };

    const updateBrand = (data: Partial<ManufacturerBrand>) => {
        if (!editingBrand) return;
        setBrands(prev => prev.map(b => b.id === editingBrand.id ? { ...b, ...data } : b));
        setEditingBrand(null);
    };

    const addNewBrand = () => {
        const newBrand: ManufacturerBrand = {
            id: `brand_${Date.now()}`, name: 'Novo Fabricante', icon_letter: '?', color: '#6366F1', description: 'Descrição e categoria para importação XLS.', is_active: true
        };
        setBrands([...brands, newBrand]);
        setEditingBrand(newBrand);
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB',
        fontSize: '14px', color: '#111827', background: '#fff', outline: 'none', transition: 'all 0.2s ease'
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto', minHeight: '100vh', background: 'var(--color-bg-base)' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: '#E5E7EB', padding: '6px', borderRadius: '18px', width: 'fit-content' }}>
                {[
                    { id: 'user', label: 'Conta & Segurança', icon: User },
                    { id: 'branding', label: 'Marca Watts', icon: Palette },
                    { id: 'brands', label: 'Fabricantes', icon: Share2 }
                ].map(tab => (
                    <button
                        key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '12px', border: 'none',
                            background: activeTab === tab.id ? '#fff' : 'transparent',
                            color: activeTab === tab.id ? 'var(--color-primary)' : '#4B5563',
                            fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ minHeight: '520px' }}>
                {activeTab === 'user' && (
                    <div className="card" style={{ padding: '32px', animation: 'fadeIn 0.2s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <User size={20} color="var(--color-primary)" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Perfil do Administrador</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '40px' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: '#fff', border: '2px solid #E5E7EB', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {localUser.avatar_url ? <img src={localUser.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={48} color="#D1D5DB" />}
                                </div>
                                <label style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--color-primary)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', border: '3px solid #fff' }}>
                                    <Camera size={18} />
                                    <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'avatar')} />
                                </label>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div><label style={{ fontSize: '11px', fontWeight: 800, color: '#666', marginBottom: '8px', display: 'block' }}>NOME</label><input type="text" style={inputStyle} value={localUser.full_name} onChange={e => setLocalUser(p => ({ ...p, full_name: e.target.value }))} /></div>
                                <div><label style={{ fontSize: '11px', fontWeight: 800, color: '#666', marginBottom: '8px', display: 'block' }}>LOGIN</label><input type="text" style={{ ...inputStyle, background: '#F9FAFB' }} value={user?.email} disabled /></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'branding' && (
                    <div className="card" style={{ padding: '32px', animation: 'fadeIn 0.2s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                            <Palette size={20} color="var(--color-primary)" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Identidade Visual</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '11px', fontWeight: 800, color: '#666', marginBottom: '8px', display: 'block' }}>NOME DA EMPRESA</label><input type="text" style={inputStyle} value={localBranding.company_name} onChange={e => setLocalBranding(p => ({ ...p, company_name: e.target.value }))} /></div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#666', marginBottom: '8px', display: 'block' }}>COR DA MARCA</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input type="color" value={localBranding.primary_color} onChange={e => setLocalBranding(p => ({ ...p, primary_color: e.target.value }))} style={{ width: '48px', height: '48px', borderRadius: '10px', border: 'none', cursor: 'pointer' }} />
                                    <input type="text" style={inputStyle} value={localBranding.primary_color} readOnly />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#666', marginBottom: '8px', display: 'block' }}>LOGO PARA PDF/REPORTE</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '90px', height: '48px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {localBranding.logo_url ? <img src={localBranding.logo_url} style={{ maxWidth: '80%', maxHeight: '80%' }} /> : <Upload size={18} color="#D1D5DB" />}
                                    </div>
                                    <label className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}>Alterar <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'logo')} /></label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'brands' && (
                    <div style={{ animation: 'fadeIn 0.2s ease' }}>
                        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid #F1F1F1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA' }}>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>Fabricantes Disponíveis</h3>
                                    <p style={{ fontSize: '13px', color: '#666' }}>Personalize ícones e cores para a listagem da frota.</p>
                                </div>
                                <WattsButton variant="primary" size="sm" onClick={addNewBrand} icon={<Plus size={16} />}>
                                    Novo Fabricante
                                </WattsButton>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {brands.map((brand, idx) => (
                                    <div key={brand.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: idx === brands.length - 1 ? 'none' : '1px solid #F1F1F1' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                                {brand.logo_url ? (
                                                    <img src={brand.logo_url} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                                ) : (
                                                    <span style={{ fontSize: '18px', fontWeight: 900, color: brand.color }}>{brand.icon_letter}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{brand.name}</h4>
                                                <p style={{ fontSize: '12px', color: '#666' }}>{brand.description}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: brand.color, border: '1px solid rgba(0,0,0,0.1)' }} />
                                            <button className="btn-icon" onClick={() => setEditingBrand(brand)}><Edit2 size={16} /></button>
                                            <button className="btn-icon" style={{ color: '#EF4444' }} onClick={() => setBrands(brands.filter(b => b.id !== brand.id))}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {editingBrand && (
                            <div style={{ marginTop: '24px', padding: '32px', background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '24px', animation: 'fadeIn 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                                    <div>
                                        <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#C2410C' }}>Editando Fabricante</h4>
                                        <p style={{ fontSize: '13px', color: '#9A3412' }}>Personalize o visual nas faturas e Dashboards.</p>
                                    </div>
                                    <button className="btn-icon" onClick={() => setEditingBrand(null)}>&times;</button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '40px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ width: '100px', height: '100px', background: '#fff', borderRadius: '20px', border: editingBrand.logo_url ? 'none' : '2px dashed #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {editingBrand.logo_url ? <img src={editingBrand.logo_url} style={{ width: '80%', height: '80%', objectFit: 'contain' }} /> : <ImageIcon size={32} color="#FED7AA" />}
                                        </div>
                                        <label className="btn btn-outline" style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', background: '#fff' }}>
                                            Subir Logo
                                            <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'brand', editingBrand.id)} />
                                        </label>
                                        {editingBrand.logo_url && <button style={{ fontSize: '11px', color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setEditingBrand({ ...editingBrand, logo_url: undefined })}>Remover</button>}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#C2410C', display: 'block', marginBottom: '8px' }}>NOME DO FABRICANTE</label>
                                            <input type="text" style={inputStyle} value={editingBrand.name} onChange={e => setEditingBrand({ ...editingBrand, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#C2410C', display: 'block', marginBottom: '8px' }}>LETRA DE ÍCONE (FALLBACK)</label>
                                            <input type="text" style={inputStyle} maxLength={1} value={editingBrand.icon_letter} onChange={e => setEditingBrand({ ...editingBrand, icon_letter: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#C2410C', display: 'block', marginBottom: '8px' }}>COR DA MARCA</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input type="color" style={{ width: '48px', height: '48px', border: 'none', background: 'none', cursor: 'pointer' }} value={editingBrand.color} onChange={e => setEditingBrand({ ...editingBrand, color: e.target.value })} />
                                                <input type="text" style={{ ...inputStyle, fontFamily: 'monospace' }} value={editingBrand.color} readOnly />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px', borderTop: '1px solid #FED7AA', paddingTop: '24px' }}>
                                    <WattsButton variant="primary" onClick={() => updateBrand(editingBrand)}>Confirmar Alteração</WattsButton>
                                    <WattsButton variant="outline" style={{ background: '#fff' }} onClick={() => setEditingBrand(null)}>Cancelar</WattsButton>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div style={{ marginTop: '50px', borderTop: '2px solid #F1F1F1', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-outline" style={{ color: '#EF4444', borderColor: '#FEE2E2' }} onClick={() => window.location.reload()}>Descartar Tudo</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {showSuccess && <span style={{ color: '#10B981', fontWeight: 700, fontSize: '14px' }}>Configurações gravadas!</span>}
                    <WattsButton
                        variant="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                        loading={isSaving}
                        style={{ padding: '0 60px' }}
                        icon={<Save size={20} />}
                    >
                        Gravar Todas Alterações
                    </WattsButton>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default SettingsView;
