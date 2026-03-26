import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

export type System = Database['public']['Tables']['systems']['Row'];
export type SystemInsert = Database['public']['Tables']['systems']['Insert'];
export type SystemUpdate = Database['public']['Tables']['systems']['Update'];

export function useSystems() {
    const [systems, setSystems] = useState<System[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        const { data, error: err } = await supabase
            .from('systems')
            .select('*')
            .order('created_at', { ascending: false });

        if (err) setError(err.message);
        else setSystems(data ?? []);
        setLoading(false);
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const upsert = async (input: SystemInsert) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Não autenticado');

        const { data, error: err } = await supabase
            .from('systems')
            .upsert({ ...input, user_id: user.id }, { onConflict: 'sid' })
            .select()
            .single();

        if (err) throw new Error(err.message);

        setSystems(prev => {
            const exists = prev.find(s => s.sid === data.sid);
            if (exists) return prev.map(s => s.sid === data.sid ? data : s);
            return [data, ...prev];
        });

        return data;
    };

    const update = async (id: string, input: SystemUpdate) => {
        const { data, error: err } = await supabase
            .from('systems')
            .update({ ...input, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (err) throw new Error(err.message);
        setSystems(prev => prev.map(s => s.id === id ? data : s));
        return data;
    };

    const remove = async (id: string) => {
        const { error: err } = await supabase
            .from('systems')
            .delete()
            .eq('id', id);

        if (err) throw new Error(err.message);
        setSystems(prev => prev.filter(s => s.id !== id));
    };

    return { systems, setSystems, loading, error, refetch: fetch, upsert, update, remove };
}
