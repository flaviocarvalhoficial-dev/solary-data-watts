import { ClientInsert, ClientUpdate } from '../../hooks/useClients';
import { SolarProvider } from './types';

export const sungrowProvider: SolarProvider = {
    name: 'Sungrow',
    platform: 'Sungrow',

    async importSystems() {
        console.warn('Importação Sungrow ainda não implementada.');
        return [];
    },

    async getSystemDetails(sid: string) {
        console.warn(`Get Details Sungrow para ${sid} ainda não implementado.`);
        return { data: null };
    },

    mapResponseToMetadata() {
        return {};
    }
};
