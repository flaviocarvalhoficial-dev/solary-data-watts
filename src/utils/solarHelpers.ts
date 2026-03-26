import { Bill } from '../hooks/useBills';
import { Client } from '../hooks/useClients';

export type ActiveClient = Client & {
    generation: number;
    latestBill: Bill | null;
    status: 'Completo' | 'Divergente' | 'Incompleto';
    energy_today?: number;
    api_status?: string;
};

export function clientStatus(bill: Bill | null): 'Completo' | 'Divergente' | 'Incompleto' {
    if (!bill) return 'Incompleto';
    if ((bill.confidence ?? 1) < 0.8) return 'Divergente';
    return 'Completo';
}

export function calcStats(gen: number, bill: Bill, investment: number) {
    const injected = bill.injected_energy;
    const selfConsumption = Math.max(0, gen - injected);
    const totalConsumption = bill.consumption + selfConsumption;
    const tarifaMedia = bill.total_value / (bill.consumption || 1);
    const economyValue = gen * tarifaMedia;
    const reductionPercent = (economyValue / (bill.total_value + economyValue)) * 100;
    const payback = investment / (economyValue * 12 || 1);
    const roi = investment > 0 ? (economyValue * 12 / investment) * 100 : 0;
    return {
        economyValue,
        annualEconomy: economyValue * 12,
        reductionPercent: reductionPercent.toFixed(0),
        payback: payback.toFixed(1),
        roi: roi.toFixed(1),
        totalConsumption,
    };
}

export const normalizeCity = (city: string | null): string | null => {
    if (!city || typeof city !== 'string') return null;
    const res = city.trim().replace(/\s*-\s*/g, "-").replace(/\s+/g, " ").toUpperCase();
    return res === "CIDADE NÃO INF." || res === "" ? null : res;
};

export const findCityDeep = (obj: any): string | null => {
    if (!obj || typeof obj !== 'object') return null;
    const target = obj.systemInfo?.city || obj.userInfo?.city || obj.city || obj.cityName || obj.city_name || obj.city_name_en;
    if (target && typeof target === 'string') return target;
    for (const key in obj) {
        const res = findCityDeep(obj[key]);
        if (res) return res;
    }
    return null;
};
