'use client';

import { useState, useEffect } from 'react';
import { updateOrder, deleteOrder } from '@/app/actions';
import {
    Edit2, Trash2, Phone, MapPin, Package, User, Calendar, X, Check,
    AlertTriangle, Download, MessageSquare, Tag, Filter, ChevronDown,
    ChevronUp, Search, RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import OrderDetailModal from './OrderDetailModal';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    teyit_bekleniyor: { label: 'Teyit Bekleniyor', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    ulasilamadi: { label: 'Ulaşılamadı', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    teyit_alindi: { label: 'Teyit Alındı', color: 'bg-green-100 text-green-700 border-green-200' },
    kabul_etmedi: { label: 'Kabul Etmedi', color: 'bg-red-100 text-red-700 border-red-200' },
    iade_donduruldu: { label: 'İade Döndü', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function UnifiedOrdersTable({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState<any[]>(initialOrders);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedOrder, setSelectedOrder] = useState<any>(null); // For modal
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        tag: '',
    });
    const [isFilterOpen, setIsFilterOpen] = useState(true);
    const router = useRouter();

    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    // Derived state for filtering
    const filteredOrders = orders.filter(order => {
        if (filters.status && order.status !== filters.status) return false;
        if (filters.tag && (!order.tags || !order.tags.includes(filters.tag))) return false;
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                (order.name || '').toLowerCase().includes(searchLower) ||
                (order.surname || '').toLowerCase().includes(searchLower) ||
                (order.phone || '').includes(searchLower) ||
                (order.product || '').toLowerCase().includes(searchLower) ||
                (order.notes || '').toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredOrders.length && filteredOrders.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredOrders.map(o => o.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkTag = async (tag: string) => {
        if (selectedIds.size === 0) return;
        if (!confirm(`${selectedIds.size} siparişe "${tag}" etiketi eklensin mi?`)) return;

        // Optimistic update
        const updatedOrders = orders.map(o => {
            if (selectedIds.has(o.id)) {
                const currentTags = o.tags || [];
                if (!currentTags.includes(tag)) {
                    return { ...o, tags: [...currentTags, tag] };
                }
            }
            return o;
        });
        setOrders(updatedOrders);

        // Server update loop (could be batched in a real backend action ideally)
        for (const id of Array.from(selectedIds)) {
            const order = orders.find(o => o.id === id);
            if (order) {
                const currentTags = order.tags || [];
                if (!currentTags.includes(tag)) {
                    await updateOrder(id, { tags: [...currentTags, tag] });
                }
            }
        }
        router.refresh();
    };

    const handleExportExcel = () => {
        const selectedOrders = orders.filter(o => selectedIds.has(o.id));
        if (selectedOrders.length === 0) {
            alert('Lütfen dışa aktarmak için en az bir sipariş seçin.');
            return;
        }

        const exportData = selectedOrders.map(o => ({
            'HEDEF KODU': '',
            'MÜŞTERİ BARKODU': '',
            'ADI SOYADI': `${o.name || ''} ${o.surname || ''}`.toUpperCase().trim() || 'BELİRTİLMEMİŞ',
            'TELEFON1': o.phone || '',
            'TELEFON2': '',
            'İLÇE': (o.district || '').toUpperCase().trim(),
            'İL': (o.city || '').toUpperCase().trim(),
            'ADRES': (o.address || '').toUpperCase().trim(),
            'ADET': o.package_id || 1,
            'ÜRÜN': (o.product || '').toUpperCase().trim(),
            'KİLO': 0,
            'DESİ': 1,
            'FİYAT': o.total_price || 0,
            'AÇIKLAMA': (o.notes || '').toUpperCase(), // Column N mapped to notes
            'ÖDEME ŞEKLİ': 'KAPIDA ÖDEME',
            'SIPARIS NO': o.id.slice(0, 8),
            'ALIM SAATİ': '',
            'TESLİM SAATİ': '',
            'SATICI': 'EPADEM',
            'FATURA KESİLSİN': '',
            'FATURA KDV': 0,
            'ETİKETLER': (o.tags || []).join(', ')
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Siparişler");
        XLSX.writeFile(wb, `siparisler_unified_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden text-sm">
                <div
                    className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer select-none"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    <div className="flex items-center space-x-2 text-gray-700 font-bold">
                        <Filter size={16} />
                        <span>Akıllı Filtreleme</span>
                    </div>
                    {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {isFilterOpen && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Arama</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="İsim, Tel, Not..."
                                    value={filters.search}
                                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Durum</label>
                            <select
                                value={filters.status}
                                onChange={e => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-700"
                            >
                                <option value="">Tümü</option>
                                {Object.entries(STATUS_MAP).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Etiket</label>
                            <select
                                value={filters.tag}
                                onChange={e => setFilters({ ...filters, tag: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-700"
                            >
                                <option value="">Tümü</option>
                                <option value="Sisteme Girildi">Sisteme Girildi</option>
                                {/* Add more dynamic tags here if needed */}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({ status: '', search: '', tag: '' })}
                                className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-bold text-xs uppercase transition-colors flex items-center justify-center space-x-2"
                            >
                                <RefreshCw size={14} />
                                <span>Sıfırla</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-bold text-gray-500">
                        {selectedIds.size} Seçili
                    </span>
                    {selectedIds.size > 0 && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleBulkTag('Sisteme Girildi')}
                                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase hover:bg-blue-100 transition flex items-center space-x-2"
                            >
                                <Tag size={14} />
                                <span>"Sisteme Girildi" Ekle</span>
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleExportExcel}
                    disabled={selectedIds.size === 0}
                    className={`px-6 py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase hover:bg-green-700 transition shadow-lg flex items-center space-x-2 ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                    <Download size={16} />
                    <span>Excel İndir</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Müşteri</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">İletişim</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ürün</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Not</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Durum</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Etiketler</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className={`hover:bg-blue-50/30 transition-colors group cursor-pointer ${selectedIds.has(order.id) ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="p-4" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(order.id)}
                                                onChange={() => toggleSelect(order.id)}
                                                className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-600 font-bold text-xs uppercase">
                                                    {order.name?.[0]}{order.surname?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight uppercase">{order.name} {order.surname}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center">
                                                        <Calendar size={10} className="mr-1" />
                                                        {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                            <PhoneZoom phone={order.phone} />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                                    <Package size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-800 uppercase">{order.product}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">{order.package_id} Adet • {order.total_price} ₺</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                            {order.notes ? (
                                                <div className="group/note relative inline-block">
                                                    <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center cursor-help">
                                                        <MessageSquare size={16} />
                                                    </div>

                                                    {/* Tooltip Bubble */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-xl shadow-xl opacity-0 invisible group-hover/note:opacity-100 group-hover/note:visible transition-all z-50 pointer-events-none">
                                                        <p className="font-medium text-center">{order.notes}</p>
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${STATUS_MAP[order.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                                                {STATUS_MAP[order.status]?.label || order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {order.tags && order.tags.length > 0 ? (
                                                    order.tags.map((tag: string, i: number) => (
                                                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100">
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-300 text-xs">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center text-gray-500 font-medium">
                                        Kriterlere uygun sipariş bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={() => router.refresh()}
                    isUnified={true} // Hint for modal to show notes/tags logic if separated
                />
            )}
        </div>
    );
}

function PhoneZoom({ phone }: { phone: string }) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        const timeout = setTimeout(() => setIsZoomed(true), 1500); // Wait 1.5s
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        setIsZoomed(false);
    };

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-all"
            >
                <Phone size={12} className="text-gray-400" />
                <span className="font-bold text-gray-700 text-xs tracking-wide">
                    {phone}
                </span>
            </div>
            {isZoomed && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 backdrop-blur-md text-white px-12 py-8 rounded-[32px] shadow-2xl z-[100] border border-white/10 animate-in zoom-in-90 duration-200 text-center">
                    <Phone size={48} className="mx-auto mb-4 text-green-400" />
                    <p className="text-4xl font-black tracking-widest font-mono">{phone}</p>
                    <p className="text-sm mt-4 text-gray-400 font-bold uppercase tracking-widest">Müşteri Telefonu</p>
                </div>
            )}
        </div>
    );
}
