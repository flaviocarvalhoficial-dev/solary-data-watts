import * as XLSX from 'xlsx';

export interface MappedSystem {
    sid: string;
    cliente: string;
    account: string;
    cidade: string;
    estado: string;
    pais: string;
    potencia_kwp: number;
    tipo: string;
    tem_meter: boolean;
    data_instalacao: string;
    status: 'normal' | 'alerta' | 'erro';
    fonte: 'apsystems_xls';
    _error?: string;
}

const HEADER_MAP: Record<string, keyof MappedSystem> = {
    'ID': 'sid', // Case where ID is the system ID
    'ECU ID': 'sid', // Preferred for sid according to user rules
    'Name': 'cliente',
    'Customer Account': 'account',
    'City': 'cidade',
    'State': 'estado',
    'Country/Region': 'pais',
    'System Size(KW)': 'potencia_kwp',
    'System Type': 'tipo',
    'Register Date': 'data_instalacao',
    'System Status': 'status',
};

export const parseAPsystemsXLS = async (file: File): Promise<MappedSystem[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet) as any[];

                const mapped = rows.map((row) => {
                    const system: Partial<MappedSystem> = {
                        fonte: 'apsystems_xls',
                    };

                    // Basic fuzzy matching for headers if they are not exact
                    Object.keys(row).forEach((header) => {
                        const normalizedHeader = header.trim();
                        const targetKey = HEADER_MAP[normalizedHeader];

                        if (targetKey) {
                            let value = row[header];

                            if (targetKey === 'potencia_kwp') {
                                value = parseFloat(value) || 0;
                            }

                            if (targetKey === 'status') {
                                const s = String(value).toLowerCase();
                                if (s.includes('normal')) value = 'normal';
                                else if (s.includes('alert') || s.includes('alerta')) value = 'alerta';
                                else value = 'erro';
                            }

                            if (targetKey === 'data_instalacao') {
                                try {
                                    // Handle Excel date serial or string
                                    let d;
                                    if (typeof value === 'number') {
                                        d = new Date((value - 25569) * 86400 * 1000);
                                    } else {
                                        d = new Date(value);
                                    }

                                    if (!isNaN(d.getTime())) {
                                        value = d.toISOString().split('T')[0]; // yyyy-MM-dd
                                    }
                                } catch (e) { /* keep as is if failed */ }
                            }

                            (system as any)[targetKey] = value;
                        }
                    });

                    // Rules transformation
                    if (system.tipo === "Photovoltaic") {
                        system.tem_meter = false;
                    } else if (system.tipo === "Photovoltaic, Meter") {
                        system.tem_meter = true;
                    } else {
                        system.tem_meter = false; // Default
                    }

                    // Validation
                    if (!system.sid) {
                        system._error = 'ECU ID obrigatório';
                    } else if (!system.cliente) {
                        system._error = 'Nome obrigatório';
                    }

                    return system as MappedSystem;
                }).filter(sys => {
                    // Ignore empty lines (no sid and no cliente)
                    return sys.sid || sys.cliente;
                });

                resolve(mapped);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
    });
};
