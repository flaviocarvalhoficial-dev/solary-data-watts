import { APsystemsEnergyService } from '../services/apsystemsEnergy';
import { ClientInsert, ClientUpdate } from '../../hooks/useClients';
import { SolarProvider } from './types';

export const apsystemsProvider: SolarProvider = {
    name: 'APsystems',
    platform: 'APsystems',

    async importSystems() {
        // ELIMINADO: API não deve ser usada para listagem (Regra do Módulo 2)
        console.warn("[APsystems] Importação via API desativada. Use o módulo XLS.");
        return [];
    },

    async getSystemDetails(sid: string) {
        // Agora usamos o serviço refatorado para buscar o snapshot completo
        return await APsystemsEnergyService.buildEnergySnapshot({ sid });
    },

    async getSystemStats(sid: string) {
        return await APsystemsEnergyService.getSystemSummary(sid);
    },

    mapResponseToMetadata(detailsRaw: any, statsRaw: any, sys: any): Partial<ClientInsert | ClientUpdate> {
        // detailsRaw aqui será o EnergySnapshot retornado pelo getSystemDetails
        const sid = detailsRaw?.sid || sys?.sid || '';

        // Se já for um snapshot (do Sync), extraímos os dados
        const generation = detailsRaw?.generation?.lifetime || 0;
        const energyToday = detailsRaw?.generation?.today || 0;

        return {
            platform: 'APsystems',
            system_id: sid,
            last_generation: generation,
            energy_today: energyToday,
            last_api_sync: new Date().toISOString()
        };
    }
};
