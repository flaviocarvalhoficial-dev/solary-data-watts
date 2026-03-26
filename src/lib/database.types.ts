export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    organization_name: string | null
                    avatar_url: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    organization_name?: string | null
                    avatar_url?: string | null
                }
                Update: {
                    full_name?: string | null
                    organization_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
            }
            clients: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    uc: string
                    platform: 'APsystems' | 'Sungrow' | 'GoodWe'
                    system_id: string
                    investment: number
                    activation_date: string | null
                    consumption_profile: string | null
                    created_at: string | null
                    updated_at: string | null
                    last_generation: number | null
                    city: string | null
                    api_status: string | null
                    ecu_id: string | null
                    state: string | null
                    country: string | null
                    system_size: number | null
                    system_type: string | null
                    energy_today: number | null
                    last_api_sync: string | null
                    platform_id: string | null
                    external_user_id: string | null
                    external_system_id: string | null
                    sid: string | null
                    integrator_id: string | null
                    platform_create_user_id: string | null
                    platform_update_user_id: string | null
                    source: string | null
                }
                Insert: {
                    user_id: string
                    name: string
                    uc: string
                    platform: 'APsystems' | 'Sungrow' | 'GoodWe'
                    system_id: string
                    investment?: number
                    activation_date?: string | null
                    consumption_profile?: string | null
                    last_generation?: number | null
                    city?: string | null
                    api_status?: string | null
                    ecu_id?: string | null
                    state?: string | null
                    country?: string | null
                    system_size?: number | null
                    system_type?: string | null
                    energy_today?: number | null
                    last_api_sync?: string | null
                    platform_id?: string | null
                    external_user_id?: string | null
                    external_system_id?: string | null
                    sid?: string | null
                    integrator_id?: string | null
                    platform_create_user_id?: string | null
                    platform_update_user_id?: string | null
                    source?: string | null
                }
                Update: {
                    name?: string
                    uc?: string
                    platform?: 'APsystems' | 'Sungrow' | 'GoodWe'
                    system_id?: string
                    investment?: number
                    activation_date?: string | null
                    consumption_profile?: string | null
                    updated_at?: string | null
                    last_generation?: number | null
                    city?: string | null
                    api_status?: string | null
                    ecu_id?: string | null
                    state?: string | null
                    country?: string | null
                    system_size?: number | null
                    system_type?: string | null
                    energy_today?: number | null
                    last_api_sync?: string | null
                    platform_id?: string | null
                    external_user_id?: string | null
                    external_system_id?: string | null
                    sid?: string | null
                    integrator_id?: string | null
                    platform_create_user_id?: string | null
                    platform_update_user_id?: string | null
                    source?: string | null
                }
            }
            bills: {
                Row: {
                    id: string
                    client_id: string
                    competency: string
                    consumption: number
                    injected_energy: number
                    total_value: number
                    street_lighting: number | null
                    confidence: number | null
                    storage_path: string | null
                    created_at: string | null
                }
                Insert: {
                    client_id: string
                    competency: string
                    consumption: number
                    injected_energy: number
                    total_value: number
                    street_lighting?: number | null
                    confidence?: number | null
                    storage_path?: string | null
                }
                Update: {
                    competency?: string
                    consumption?: number
                    injected_energy?: number
                    total_value?: number
                    street_lighting?: number | null
                    confidence?: number | null
                    storage_path?: string | null
                }
            }
            calculations: {
                Row: {
                    id: string
                    client_id: string
                    bill_id: string
                    generation: number
                    economy_value: number
                    reduction_percent: number | null
                    payback_estimate: number | null
                    created_at: string | null
                }
                Insert: {
                    client_id: string
                    bill_id: string
                    generation: number
                    economy_value: number
                    reduction_percent?: number | null
                    payback_estimate?: number | null
                }
                Update: {
                    generation?: number
                    economy_value?: number
                    reduction_percent?: number | null
                    payback_estimate?: number | null
                }
            }
            audit_logs: {
                Row: {
                    id: string
                    client_id: string | null
                    user_id: string | null
                    event_type: string
                    original_data: Json | null
                    new_data: Json | null
                    created_at: string | null
                }
                Insert: {
                    client_id?: string | null
                    user_id?: string | null
                    event_type: string
                    original_data?: Json | null
                    new_data?: Json | null
                }
            }
            systems: {
                Row: {
                    id: string
                    user_id: string
                    sid: string
                    cliente: string
                    account: string | null
                    cidade: string | null
                    estado: string | null
                    pais: string | null
                    potencia_kwp: number | null
                    tipo: string | null
                    tem_meter: boolean
                    data_instalacao: string | null
                    status: string | null
                    fonte: string | null
                    last_generation: number | null
                    energy_today: number | null
                    meter_data: Json | null
                    last_sync: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    user_id?: string
                    sid: string
                    cliente: string
                    account?: string | null
                    cidade?: string | null
                    estado?: string | null
                    pais?: string | null
                    potencia_kwp?: number | null
                    tipo?: string | null
                    tem_meter?: boolean
                    data_instalacao?: string | null
                    status?: string | null
                    fonte?: string | null
                    last_generation?: number | null
                    energy_today?: number | null
                    meter_data?: Json | null
                    last_sync?: string | null
                }
                Update: {
                    sid?: string
                    cliente?: string
                    account?: string | null
                    cidade?: string | null
                    estado?: string | null
                    pais?: string | null
                    potencia_kwp?: number | null
                    tipo?: string | null
                    tem_meter?: boolean
                    data_instalacao?: string | null
                    status?: string | null
                    fonte?: string | null
                    last_generation?: number | null
                    energy_today?: number | null
                    meter_data?: Json | null
                    last_sync?: string | null
                    updated_at?: string | null
                }
            }
        }
    }
}
