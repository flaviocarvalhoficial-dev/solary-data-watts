import { ClientInsert, ClientUpdate } from '../../hooks/useClients';
import { SolarProvider } from './types';

export const goodweProvider: SolarProvider = {
    name: 'GoodWe',
    platform: 'GoodWe',

    async importSystems() {
        console.warn('Importação GoodWe ainda não implementada.');
        return [];
    },

    async getSystemDetails(sid: string) {
        console.warn(`Get Details GoodWe para ${sid} ainda não implementado.`);
        return { data: null };
    },

    mapResponseToMetadata() {
        return {};
    }
};
