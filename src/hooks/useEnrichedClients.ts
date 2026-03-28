import { useMemo } from 'react';
import { Client } from './useClients';
import { System } from './useSystems';
import { Bill } from './useBills';
import { ActiveClient, clientStatus } from '../utils/solarHelpers';

interface UseEnrichedClientsProps {
    clients: Client[];
    systems: System[];
    billMap: Map<string, Bill>;
}

export function useEnrichedClients({ clients, systems, billMap }: UseEnrichedClientsProps) {
    const enrichedClients = useMemo(() => {
        const platformClients = clients.map(c => {
            const bill = billMap.get(c.id) || null;
            return {
                ...c,
                generation: bill?.generation ?? (c as any).last_generation ?? 0,
                latestBill: bill,
                status: clientStatus(bill),
            } as ActiveClient;
        });

        const appSystemsOnly = systems.map(s => {
            return {
                id: s.id,
                name: s.cliente,
                uc: s.account || 'PENDENTE',
                platform: 'APsystems',
                system_id: s.sid,
                city: s.cidade || '—',
                state: s.estado || '—',
                country: s.pais || '—',
                system_size: s.potencia_kwp || 0,
                activation_date: s.data_instalacao,
                api_status: s.status === 'normal' ? 'Normal' : s.status === 'alerta' ? 'Atenção' : 'Erro',
                generation: 0,
                latestBill: null,
                status: 'Incompleto',
                source: s.fonte || 'apsystems_xls',
            } as any as ActiveClient;
        });

        // Mix clients from clients table + the new systems table
        // Filter out those from systems table that might already exist in clients by system_id
        const filteredSystems = appSystemsOnly.filter(s => !platformClients.some(pc => pc.system_id === s.system_id));

        return [...platformClients, ...filteredSystems];
    }, [clients, systems, billMap]);

    return enrichedClients;
}
