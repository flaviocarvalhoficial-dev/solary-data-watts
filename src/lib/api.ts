import { supabase } from './supabase';
import { Database } from './database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];
type Bill = Database['public']['Tables']['bills']['Row'];
type BillInsert = Database['public']['Tables']['bills']['Insert'];
type Calculation = Database['public']['Tables']['calculations']['Row'];
type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];

const SUPABASE_URL = 'https://bxexrczrtysxfjsikquq.supabase.co';
const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;

const getAuthHeader = async () => {
    const { data } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${data.session?.access_token}` };
};

// ===== CLIENTS CRUD =====
export const api = {
    clients: {
        list: async (): Promise<Client[]> => {
            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTIONS_BASE}/clients-crud`, { headers });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },

        get: async (id: string): Promise<Client> => {
            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTIONS_BASE}/clients-crud?id=${id}`, { headers });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },

        create: async (client: Omit<ClientInsert, 'user_id'>): Promise<Client> => {
            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTIONS_BASE}/clients-crud`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(client),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },

        update: async (id: string, client: ClientUpdate): Promise<Client> => {
            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTIONS_BASE}/clients-crud?id=${id}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(client),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },

        delete: async (id: string): Promise<void> => {
            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTIONS_BASE}/clients-crud?id=${id}`, {
                method: 'DELETE',
                headers,
            });
            if (!res.ok) throw new Error(await res.text());
        },
    },

    // ===== BILLS CRUD =====
    bills: {
        list: async (clientId?: string): Promise<Bill[]> => {
            const headers = await getAuthHeader();
            const qs = clientId ? `?client_id=${clientId}` : '';
            const res = await fetch(`${FUNCTIONS_BASE}/bills-crud${qs}`, { headers });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },

        create: async (bill: BillInsert): Promise<Bill> => {
            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTIONS_BASE}/bills-crud`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(bill),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },

        update: async (id: string, bill: Partial<BillInsert>): Promise<Bill> => {
            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTIONS_BASE}/bills-crud?id=${id}`, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(bill),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },

        delete: async (id: string): Promise<void> => {
            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTIONS_BASE}/bills-crud?id=${id}`, {
                method: 'DELETE',
                headers,
            });
            if (!res.ok) throw new Error(await res.text());
        },

        uploadPDF: async (file: File, clientId: string): Promise<{ storage_path: string, signed_url: string }> => {
            const headers = await getAuthHeader();
            const formData = new FormData();
            formData.append('file', file);
            formData.append('client_id', clientId);

            const res = await fetch(`${FUNCTIONS_BASE}/upload-bill-pdf`, {
                method: 'POST',
                headers, // No Content-Type — FormData sets it with boundary
                body: formData,
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
    },

    // ===== CALCULATIONS CRUD =====
    calculations: {
        list: async (clientId?: string): Promise<Calculation[]> => {
            const headers = await getAuthHeader();
            const qs = clientId ? `?client_id=${clientId}` : '';
            const res = await fetch(`${FUNCTIONS_BASE}/calculations-crud${qs}`, { headers });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },

        save: async (calc: Omit<Calculation, 'id' | 'created_at'>): Promise<Calculation> => {
            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTIONS_BASE}/calculations-crud`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify(calc),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },

        delete: async (id: string): Promise<void> => {
            const headers = await getAuthHeader();
            const res = await fetch(`${FUNCTIONS_BASE}/calculations-crud?id=${id}`, {
                method: 'DELETE',
                headers,
            });
            if (!res.ok) throw new Error(await res.text());
        },
    },

    // ===== AUDIT LOGS (write-only via Supabase direct) =====
    audit: {
        log: async (entry: AuditLogInsert) => {
            const { error } = await supabase.from('audit_logs').insert(entry);
            if (error) console.error('[Audit Log Error]', error.message);
        },
    },
};
