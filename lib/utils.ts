export const STATUS_MAP: Record<string, string> = {
    'teyit_bekleniyor': 'Teyit bekleniyor',
    'ulasilamadi': 'Ulaşılamadı',
    'teyit_alindi': 'Teyit alındı',
    'kabul_etmedi': 'Kabul etmedi',
    'iade_donduruldu': 'İade döndü'
};

export const REVERSE_STATUS_MAP: Record<string, string> = Object.entries(STATUS_MAP).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {} as Record<string, string>);

export function getStatusLabel(status: string) {
    return STATUS_MAP[status] || status;
}
