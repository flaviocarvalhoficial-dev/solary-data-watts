import { apsystemsProvider } from './apsystems';
import { sungrowProvider } from './sungrow';
import { goodweProvider } from './goodwe';

export const PROVIDERS = {
    APsystems: apsystemsProvider,
    Sungrow: sungrowProvider,
    GoodWe: goodweProvider,
};

export type ProviderKey = keyof typeof PROVIDERS;

export function getProvider(platform: string) {
    return PROVIDERS[platform as ProviderKey] || PROVIDERS.APsystems;
}
