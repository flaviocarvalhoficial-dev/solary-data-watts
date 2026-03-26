import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { parseFaturaPDF } from '../utils/pdfParser';
import { logAuditEvent } from './useAuditLog';
import { Client } from './useClients';
import { System } from './useSystems';

interface UseBillUploadProps {
    clients: Client[];
    systems: System[];
    createClient: (input: any) => Promise<any>;
    updateClient: (id: string, data: any) => Promise<any>;
    createBill: (input: any) => Promise<any>;
    refetchClients: () => Promise<void>;
}

export function useBillUpload({ clients, systems, createClient, updateClient, createBill, refetchClients }: UseBillUploadProps) {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [unlinkedBill, setUnlinkedBill] = useState<{ parsed: any, file: File } | null>(null);
    const [pendingReview, setPendingReview] = useState<{ parsed: any, file: File, clientId: string } | null>(null);

    const processSingleBill = async (file: File, parsed: any, targetClientId: string) => {
        console.log(`[BILL PROCESS] Iniciando processamento do arquivo: ${file.name} para cliente: ${targetClientId}`);

        // 2. Subir para Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${targetClientId}_${parsed.competency.replace('/', '_')}_${Date.now()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        console.log(`[BILL PROCESS] Subindo para storage: ${filePath}...`);
        const { data: uploadData, error: uploadError } = await supabase.storage.from('bills').upload(filePath, file);

        if (uploadError) {
            console.error(`[BILL PROCESS] Erro no upload storage:`, uploadError);
            throw new Error(`Falha ao salvar arquivo no storage: ${uploadError.message}`);
        }

        console.log(`[BILL PROCESS] Criando registro no banco para competência ${parsed.competency}...`);
        // 3. Criar registro no banco
        await createBill({
            client_id: targetClientId,
            competency: parsed.competency,
            consumption: parsed.gridConsumption,
            compensated_energy: parsed.compensatedEnergy,
            credit_balance: parsed.creditBalance,
            injected_energy: parsed.injectedEnergy,
            total_value: parsed.totalValue,
            street_lighting: parsed.streetLighting,
            tariff_kwh: parsed.tariffKwh,
            confidence: parsed.confidence,
            storage_path: uploadData?.path || null
        });

        // 4. Atualizar o timestamp de atualização do cliente para persistir "Última atualização"
        console.log(`[BILL PROCESS] Atualizando timestamp do cliente...`);
        await updateClient(targetClientId, { updated_at: new Date().toISOString() });
        await logAuditEvent('PDF_UPLOAD', targetClientId, null, { competency: parsed.competency, mode: 'ManualLink' });
        console.log(`[BILL PROCESS] Finalizado com sucesso: ${file.name}`);
    };

    const uploadFiles = async (files: FileList | File[], targetClientId?: string) => {
        if (!files.length) return;

        console.log(`[BILL UPLOAD] ${files.length} arquivos para processar.`);
        setIsUploading(true);
        const fileList = Array.from(files);
        const processedIds = new Set<string>();
        let firstUnlinked: { parsed: any, file: File } | null = null;

        try {
            for (const file of fileList) {
                console.log(`[BILL UPLOAD] Processando: ${file.name}`);
                try {
                    // 1. Parse PDF para obter dados (Competência, UC, etc)
                    const parsed = await parseFaturaPDF(file);
                    console.log(`[BILL UPLOAD] Dados extraídos da UC: ${parsed.uc}`);

                    let client: any = null;

                    if (targetClientId) {
                        client = clients.find(c => c.id === targetClientId) || (systems as any[]).find(s => s.id === targetClientId);
                    } else {
                        const normalizeUC = (val: string) => val.replace(/\D/g, '').replace(/^0+/, '');
                        const targetUC = normalizeUC(parsed.uc);

                        client = clients.find(c => {
                            const dbUC = normalizeUC(c.uc);
                            return dbUC === targetUC || dbUC.endsWith(targetUC) || targetUC.endsWith(dbUC);
                        });

                        if (!client) {
                            client = systems.find(s => {
                                const dbUC = normalizeUC(s.account || '');
                                return dbUC === targetUC || (dbUC.length > 5 && (dbUC.endsWith(targetUC) || targetUC.endsWith(dbUC)));
                            });
                        }
                    }

                    if (!client) {
                        console.warn(`[BILL UPLOAD] UC ${parsed.uc} não encontrada automática. Guardando para manual.`);
                        if (!firstUnlinked) firstUnlinked = { parsed, file };
                        continue;
                    }

                    const isAlreadyRegistered = clients.some(c => c.id === client.id);
                    let finalClientId = client.id;

                    if (!isAlreadyRegistered) {
                        console.log(`[BILL UPLOAD] Auto-importando sistema Discovery: ${client.sid}`);
                        const newClient = await createClient({
                            name: client.cliente || `Usina ${client.sid}`,
                            uc: parsed.uc || client.account || 'PENDENTE',
                            platform: 'APsystems',
                            system_id: client.sid,
                            city: client.cidade || '—',
                            investment: 0
                        });
                        finalClientId = newClient.id;
                    }

                    // Se for apenas 1 arquivo, pedimos revisão antes de salvar
                    if (fileList.length === 1 && !targetClientId) {
                        setPendingReview({ parsed, file, clientId: finalClientId });
                    } else {
                        await processSingleBill(file, parsed, finalClientId);
                        processedIds.add(finalClientId);
                    }
                } catch (err: any) {
                    console.error(`[BILL UPLOAD] Erro no arquivo ${file.name}:`, err);
                    alert(`Erro ao processar ${file.name}: ${err.message}`);
                }
            }

            console.log(`[BILL UPLOAD] Lote finalizado. ${processedIds.size} clientes impactados.`);
            await refetchClients();
            if (firstUnlinked) setUnlinkedBill(firstUnlinked);
        } catch (err: any) {
            console.error(`[BILL UPLOAD] Erro crítico no lote:`, err);
            alert(`Erro crítico ao processar arquivos: ${err.message}`);
        } finally {
            setIsUploading(false);
        }

        return Array.from(processedIds);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetClientId?: string) => {
        const input = e.target;
        if (!input.files?.length) return;

        const files = input.files;
        const result = await uploadFiles(files, targetClientId);

        if (input) input.value = '';
        return result;
    };

    return { uploadFiles, handleFileUpload, isUploading, unlinkedBill, setUnlinkedBill, pendingReview, setPendingReview, processSingleBill };
}
