import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (err) setError(err.message);
        else setClients(data ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const create = async (input: Omit<ClientInsert, 'user_id'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Não autenticado');

        const { data, error: err } = await supabase
            .from('clients')
            .insert({ ...input, user_id: user.id })
            .select()
            .single();

        if (err) throw new Error(err.message);
        setClients(prev => [data, ...prev]);
        return data;
    };

    const update = async (id: string, input: ClientUpdate) => {
        const { data, error: err } = await supabase
            .from('clients')
            .update({ ...input, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (err) throw new Error(err.message);
        setClients(prev => prev.map(c => c.id === id ? data : c));
        return data;
    };

    const remove = async (id: string) => {
        const { error: err } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (err) throw new Error(err.message);
        setClients(prev => prev.filter(c => c.id !== id));
    };

    return { clients, setClients, loading, error, refetch: fetch, create, update, remove };
}
