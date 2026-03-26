import { ClientInsert, ClientUpdate } from '../../hooks/useClients';

export interface ProviderResponse {
    success: boolean;
    data?: any;
    error?: string;
}

export interface SolarProvider {
    name: string;
    platform: string;

    // UI Hooks
    importSystems: () => Promise<any[]>;
    syncSystem?: (systemId: string) => Promise<any>;
    getSystemDetails: (sid: string, ecuId?: string) => Promise<any>;
    getSystemStats?: (sid: string) => Promise<any>;

    // Data mapping
    mapResponseToMetadata: (details: any, stats?: any, originalSystem?: any, existingCity?: string | null) => Partial<ClientInsert | ClientUpdate>;
}
