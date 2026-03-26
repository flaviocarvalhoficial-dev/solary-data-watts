import { supabase } from '../lib/supabase';

export type AuditEventType = 'MANUAL_EDIT' | 'FALLBACK_APPLIED' | 'PDF_UPLOAD' | 'REPORT_GENERATED' | 'API_SYNC' | 'SYSTEM_SYNC_BATCH' | 'SYSTEM_SYNC_INDIVIDUAL' | 'SYSTEM_IMPORT';

export async function logAuditEvent(
    event_type: AuditEventType,
    client_id: string | null,
    original_data: object | null,
    new_data: object | null
) {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('audit_logs').insert({
        event_type,
        client_id,
        user_id: user?.id ?? null,
        original_data: original_data as any,
        new_data: new_data as any,
    });

    if (error) console.warn('[Audit Log]', error.message);
}
