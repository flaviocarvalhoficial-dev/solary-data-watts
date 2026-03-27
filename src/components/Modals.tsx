import React from 'react';
import { X, Zap, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Search, FileText } from 'lucide-react';
import { MappedSystem, parseAPsystemsXLS } from '../utils/xlsImporter';

interface NewClientModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    form: any;
    setForm: (form: any) => void;
    loading: boolean;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
    show, setShow, onSubmit, form, setForm, loading
}) => {
    if (!show) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <form onSubmit={onSubmit} style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '440px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Novo Sistema</h3>
                    <button type="button" onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                {[
                    { label: 'Nome do Cliente', field: 'name', type: 'text', placeholder: 'Ex: João Silva' },
                    { label: 'Conta Contrato', field: 'uc', type: 'text', placeholder: 'Ex: 3028275551' },
                    { label: 'System ID (APsystems)', field: 'system_id', type: 'text', placeholder: 'ID da plataforma' },
                    { label: 'Investimento (R$)', field: 'investment', type: 'number', placeholder: '0' },
                    { label: 'Tarifa (R$/kWh)', field: 'current_kwh_value', type: 'number', placeholder: '0.95' },
                ].map(({ label, field, type, placeholder }) => (
                    <div key={field}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>{label}</label>
                        <input
                            type={type}
                            placeholder={placeholder}
                            required={field !== 'investment'}
                            value={form[field]}
                            onChange={e => setForm((p: any) => ({ ...p, [field]: type === 'number' ? parseFloat(e.target.value || '0') : e.target.value }))}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                        />
                    </div>
                ))}
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Plataforma</label>
                    <select value={form.platform} onChange={e => setForm((p: any) => ({ ...p, platform: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}>
                        <option>APsystems</option>
                        <option>Sungrow</option>
                        <option>GoodWe</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Sistema'}
                </button>
            </form>
        </div>
    );
};

interface ImportModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    list: any[];
    onImport: (sys: any) => void;
    onImportAll: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
    show, setShow, list, onImport, onImportAll
}) => {
    if (!show) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Sistemas Encontrados ({list.length})</h3>
                    <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {list.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>Nenhum sistema novo encontrado.</p>
                    ) : list.map((sys, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>
                                    {sys.username || sys.customerAccount || sys.userAccount || sys.customer_account ||
                                        sys.account || sys.accountName || sys.sname || sys.name ||
                                        sys.systemName || sys.customerName || 'Usina sem nome'}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ID: {sys.sid || sys.id || sys.systemId}</div>
                            </div>
                            <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => onImport(sys)}>Importar</button>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={onImportAll} disabled={list.length === 0}>Importar Todos</button>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShow(false)}>Fechar</button>
                </div>
            </div>
        </div>
    );
};

interface XLSImportModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    existingSids: string[];
    onImportComplete: (systems: MappedSystem[]) => void;
}

export const XLSImportModal: React.FC<XLSImportModalProps> = ({
    show, setShow, existingSids, onImportComplete
}) => {
    const [file, setFile] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<MappedSystem[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const stats = React.useMemo(() => {
        if (!preview.length) return { total: 0, new: 0, updated: 0, errors: 0 };
        const errors = preview.filter(s => s._error).length;
        const valid = preview.filter(s => !s._error);
        const updated = valid.filter(s => existingSids.includes(s.sid)).length;
        const newSystems = valid.length - updated;
        return { total: preview.length, new: newSystems, updated, errors };
    }, [preview, existingSids]);

    if (!show) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        setFile(selected);
        setLoading(true);
        setError(null);

        try {
            const data = await parseAPsystemsXLS(selected);
            setPreview(data);
            if (data.length === 0) {
                setError('Nenhum dado encontrado na planilha.');
            }
        } catch (err: any) {
            setError(`Erro ao ler arquivo: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = () => {
        const validSystems = preview.filter(s => !s._error);
        if (validSystems.length === 0) return;
        onImportComplete(validSystems);
        setShow(false);
        setFile(null);
        setPreview([]);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#EEF2FF', padding: '10px', borderRadius: '12px' }}>
                            <FileSpreadsheet size={24} color="#6366F1" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Importador APsystems XLS</h3>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Fonte oficial de cadastro de sistemas</p>
                        </div>
                    </div>
                    <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--color-text-muted)' }}><X size={20} /></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
                    {!file ? (
                        <label style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            height: '240px', border: '2px dashed var(--color-border)', borderRadius: '16px',
                            cursor: 'pointer', background: '#F9FAFB', transition: 'all 0.2s'
                        }} onMouseOver={e => e.currentTarget.style.borderColor = '#6366F1'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                            <Upload size={40} color="#9CA3AF" style={{ marginBottom: '16px' }} />
                            <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Selecione o arquivo .xls ou .csv</span>
                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: '300px' }}>
                                A planilha deve conter colunas como ECU ID, Name, e System Status.
                            </span>
                            <input type="file" accept=".xls,.xlsx,.csv" style={{ display: 'none' }} onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F3F4F6', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FileSpreadsheet size={20} color="#6366F1" />
                                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{file.name}</span>
                                </div>
                                <button onClick={() => { setFile(null); setPreview([]); setError(null); }} style={{ fontSize: '12px', color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Trocar arquivo</button>
                            </div>

                            {loading && <p style={{ textAlign: 'center', color: '#6366F1', margin: '20px 0' }}>Processando dados...</p>}

                            {error && (
                                <div style={{ padding: '16px', background: '#FEF2F2', borderRadius: '12px', display: 'flex', gap: '12px', border: '1px solid #FEE2E2' }}>
                                    <AlertCircle size={20} color="#EF4444" />
                                    <p style={{ fontSize: '13px', color: '#991B1B' }}>{error}</p>
                                </div>
                            )}

                            {!loading && preview.length > 0 && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                        {[
                                            { label: 'Total Linhas', val: stats.total, color: '#374151' },
                                            { label: 'Novos', val: stats.new, color: '#10B981' },
                                            { label: 'Atualizáveis', val: stats.updated, color: '#6366F1' },
                                            { label: 'Erros', val: stats.errors, color: '#EF4444' }
                                        ].map(s => (
                                            <div key={s.label} style={{ background: '#F9FAFB', padding: '12px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                                                <div style={{ fontSize: '20px', fontWeight: 700, color: s.color }}>{s.val}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visualização dos dados</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', maxHeight: '200px', overflowY: 'auto' }}>
                                            {preview.map((sys, idx) => (
                                                <div key={idx} style={{ padding: '10px 14px', borderBottom: idx < preview.length - 1 ? '1px solid var(--color-border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: sys._error ? '#FFF5F5' : 'transparent' }}>
                                                    <div>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            {sys.cliente || <em style={{ color: '#EF4444' }}>Nome faltando</em>}
                                                            {sys._error && <AlertCircle size={14} color="#EF4444" />}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                                            {sys.sid || 'Sem ECU ID'} • {sys.cidade || '—'}/{sys.estado || '—'}
                                                        </div>
                                                        {sys._error && <div style={{ fontSize: '10px', color: '#EF4444', fontWeight: 600 }}>{sys._error}</div>}
                                                    </div>
                                                    {!sys._error && (
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '13px', fontWeight: 700 }}>{sys.potencia_kwp} kWp</div>
                                                            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: sys.status === 'normal' ? '#10B981' : sys.status === 'alerta' ? '#F59E0B' : '#DC2626', fontWeight: 700 }}>{sys.status}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={handleImport} disabled={stats.new + stats.updated === 0 || loading}>
                        {loading ? 'Processando...' : <><CheckCircle2 size={18} /> Confirmar Importação ({stats.new + stats.updated} sistemas)</>}
                    </button>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShow(false)}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

interface ManualLinkModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    unlinkedBill: { parsed: any, file: File } | null;
    clients: any[];
    onConfirm: (clientId: string) => void;
}

export const ManualLinkModal: React.FC<ManualLinkModalProps> = ({
    show, setShow, unlinkedBill, clients, onConfirm
}) => {
    const [selectedId, setSelectedId] = React.useState('');
    const [searchTerm, setSearchTerm] = React.useState('');

    if (!show || !unlinkedBill) return null;

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.system_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '500px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(232, 89, 60, 0.1)', padding: '10px', borderRadius: '14px', color: 'var(--color-primary)' }}>
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Vínculo de Conta Contrato Manual</h3>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Não encontramos um sistema para a Conta Contrato {unlinkedBill.parsed.uc}</p>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'var(--color-bg-base)', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Arquivo</span>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{unlinkedBill.file.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Valor / Comp</span>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>R$ {unlinkedBill.parsed.totalValue.toLocaleString('pt-BR')} ({unlinkedBill.parsed.competency})</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar cliente por nome ou ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                        {filtered.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedId(c.id)}
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    background: selectedId === c.id ? 'var(--color-primary-muted)' : 'transparent',
                                    borderBottom: '1px solid var(--color-border-light)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.1s'
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: selectedId === c.id ? 700 : 500, color: 'var(--color-text-primary)' }}>{c.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>ID {c.system_id} · Conta {c.uc}</div>
                                </div>
                                {selectedId === c.id && <CheckCircle2 size={16} color="var(--color-primary)" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn btn-primary"
                        style={{ flex: 1, height: '44px' }}
                        disabled={!selectedId}
                        onClick={() => onConfirm(selectedId)}
                    >
                        Vincular e Processar
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ flex: 1, height: '44px' }}
                        onClick={() => setShow(false)}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

interface BillReviewModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    data: any;
    client: any;
    onConfirm: () => void;
}

export const BillReviewModal: React.FC<BillReviewModalProps> = ({
    show, setShow, data, client, onConfirm
}) => {
    if (!show || !data) return null;

    const items = [
        { label: 'Conta Contrato', value: data.uc, color: '#111827' },
        { label: 'Competência', value: data.competency, color: '#111827' },
        { label: 'Total a Pagar', value: `R$ ${data.totalValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'var(--color-primary)' },
        { label: 'Consumo (Rede)', value: `${data.gridConsumption} kWh`, color: '#374151' },
        { label: 'Injetado (Total)', value: `${data.injectedEnergy} kWh`, color: '#10B981' },
        { label: 'Compensado (GD)', value: `${data.compensatedEnergy} kWh`, color: '#6366F1' },
        { label: 'Saldo Acumulado', value: `${data.creditBalance} kWh`, color: '#F59E0B' },
        { label: 'Tarifa Aplicada', value: `R$ ${data.tariffKwh?.toFixed(4)}`, color: '#374151' },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
            <div style={{ background: '#fff', borderRadius: '28px', padding: '40px', width: '500px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--color-primary-muted)', padding: '12px', borderRadius: '18px', marginBottom: '16px', color: 'var(--color-primary)' }}>
                        <FileText size={32} />
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Revisar Dados da Fatura</h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Confirme se a leitura da IA está correta para este cliente.</p>
                </div>

                <div style={{ background: 'var(--color-bg-base)', padding: '16px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--color-border)' }}>
                    <div style={{ background: '#fff', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {client?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <div style={{ fontSize: '15px', fontWeight: 700 }}>{client?.name || 'Vínculo Manual'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ID: {client?.system_id} · Conta do Cadastro: {client?.uc}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {items.map(item => (
                        <div key={item.label} style={{ background: '#fff', padding: '14px', borderRadius: '16px', border: '1px solid var(--color-border-light)' }}>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: item.color }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <button
                        className="btn btn-primary"
                        style={{ height: '52px', fontSize: '16px', borderRadius: '14px' }}
                        onClick={onConfirm}
                    >
                        Confirmar e Salvar
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ height: '52px', fontSize: '14px', borderRadius: '14px' }}
                        onClick={() => setShow(false)}
                    >
                        Descartar
                    </button>
                </div>

                <div style={{ fontSize: '11px', textAlign: 'center', color: '#EF4444', background: '#FEF2F2', padding: '8px', borderRadius: '8px', fontWeight: 600 }}>
                    ⚠️ Verifique os valores antes de salvar. Erros afetarão os cálculos do relatório mensal.
                </div>
            </div>
        </div>
    );
};
