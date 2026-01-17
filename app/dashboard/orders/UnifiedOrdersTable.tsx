'use client';

import { useState, useEffect, useCallback } from 'react';
import { updateOrder } from '@/app/actions';
import {
    Edit2, Phone, Package, Calendar, Search, RefreshCw,
    Filter, ChevronDown, ChevronUp, Tag, Download, Check, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import OrderDetailModal from './OrderDetailModal';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    teyit_bekleniyor: { label: 'Teyit Bekleniyor', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    ulasilamadi: { label: 'Ulaşılamadı', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    teyit_alindi: { label: 'Teyit Alındı', color: 'bg-green-100 text-green-700 border-green-200' },
    kabul_etmedi: { label: 'Kabul Etmedi', color: 'bg-red-100 text-red-700 border-red-200' },
    iade_donduruldu: { label: 'İade Döndü', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function UnifiedOrdersTable({
    initialOrders,
    totalCount,
    currentPage,
    totalPages,
    products
}: {
    initialOrders: any[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    products: any[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State for orders (synced with initialOrders from server)
    const [orders, setOrders] = useState<any[]>(initialOrders);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(true);

    // Sync state with server prop
    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    // -- URL Filter Management Helpers --

    const createQueryString = useCallback(
        (params: Record<string, string | number | null>) => {
            const newSearchParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '') {
                    newSearchParams.delete(key);
                } else {
                    newSearchParams.set(key, String(value));
                }
            });

            return newSearchParams.toString();
        },
        [searchParams]
    );

    const updateFilter = (key: string, value: string | null) => {
        // Reset page to 1 on filter change
        router.push(pathname + '?' + createQueryString({ [key]: value, page: 1 }));
    };

    // -- Multi-Select Helper Component --
    const FilterMultiSelect = ({
        label,
        options,
        paramKey
    }: {
        label: string;
        options: { value: string; label: string }[];
        paramKey: string;
    }) => {
        const currentValues = searchParams.get(paramKey)?.split(',').filter(Boolean) || [];
        const [isOpen, setIsOpen] = useState(false);

        const toggleOption = (value: string) => {
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];

            updateFilter(paramKey, newValues.length > 0 ? newValues.join(',') : null);
        };

        return (
            <div className="relative">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1 block">{label}</label>
                <div
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer flex justify-between items-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="truncate">
                        {currentValues.length === 0 ? 'Tümü' : `${currentValues.length} Seçili`}
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                        <div
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2 border-b border-gray-100"
                            onClick={() => {
                                updateFilter(paramKey, null);
                                setIsOpen(false);
                            }}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${currentValues.length === 0 ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                {currentValues.length === 0 && <Check size={10} className="text-white" />}
                            </div>
                            <span className="text-xs font-bold text-gray-700">Tümü</span>
                        </div>
                        {options.map(opt => (
                            <div
                                key={opt.value}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(opt.value);
                                }}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${currentValues.includes(opt.value) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                    {currentValues.includes(opt.value) && <Check size={10} className="text-white" />}
                                </div>
                                <span className="text-xs font-medium text-gray-700">{opt.label}</span>
                            </div>
                        ))}
                    </div>
                )}
                {isOpen && <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />}
            </div>
        );
    };

    // -- Selection Logic --
    const toggleSelectAll = () => {
        if (selectedIds.size === orders.length && orders.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(orders.map(o => o.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const handleBulkTag = async (tag: string) => {
        if (selectedIds.size === 0) return;
        if (!confirm(`${selectedIds.size} siparişe "${tag}" etiketi eklensin mi?`)) return;

        // Optimistic
        const updatedOrders = orders.map(o => {
            if (selectedIds.has(o.id)) {
                const currentTags = o.tags || [];
                if (!currentTags.includes(tag)) return { ...o, tags: [...currentTags, tag] };
            }
            return o;
        });
        setOrders(updatedOrders);

        // Server update
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
        if (selectedOrders.length === 0) return alert('Lütfen dışa aktarmak için en az bir sipariş seçin.');

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
            'KİLO': 0, 'DESİ': 1,
            'FİYAT': o.total_price || 0,
            'AÇIKLAMA': (o.notes || '').toUpperCase(),
            'ÖDEME ŞEKLİ': 'KAPIDA ÖDEME',
            'SIPARIS NO': o.id.slice(0, 8),
            'SATICI': 'EPADEM',
            'ETİKETLER': (o.tags || []).join(', ')
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Siparişler");
        XLSX.writeFile(wb, `siparisler_unified_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Calculate pagination range
    const paginationRange = () => {
        const range = [];
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, currentPage + 2);
        for (let i = start; i <= end; i++) range.push(i);
        return range;
    };

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible text-sm relative z-20">
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
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-in slide-in-from-top-2 duration-200">
                        {/* Search */}
                        <div className="lg:col-span-1">
                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1 block">Arama</label>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="İsim, Tel, Not..."
                                    defaultValue={searchParams.get('search') || ''}
                                    onBlur={(e) => updateFilter('search', e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-700"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <FilterMultiSelect
                            label="Durum"
                            paramKey="status"
                            options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))}
                        />

                        {/* Product Filter */}
                        <FilterMultiSelect
                            label="Ürün"
                            paramKey="product"
                            options={products.map(p => ({ value: p.name, label: p.name }))}
                        />

                        {/* Tag Filter */}
                        <FilterMultiSelect
                            label="Etiket"
                            paramKey="tags"
                            options={[{ value: 'Sisteme Girildi', label: 'Sisteme Girildi' }]}
                        />

                        {/* Date Range */}
                        <div className="lg:col-span-1 grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1 block">Başlangıç</label>
                                <input
                                    type="date"
                                    className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium"
                                    value={searchParams.get('startDate') || ''}
                                    onChange={(e) => updateFilter('startDate', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-1 block">Bitiş</label>
                                <input
                                    type="date"
                                    className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium"
                                    value={searchParams.get('endDate') || ''}
                                    onChange={(e) => updateFilter('endDate', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Reset Button */}
                        <div className="flex items-end lg:col-span-1">
                            <button
                                onClick={() => router.push(pathname)}
                                className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-bold text-xs uppercase transition-colors flex items-center justify-center space-x-2"
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative z-10">
                <div className="overflow-x-auto min-h-[400px]">
                    <div className="relative">
                        {/* Loading Overlay could be added here if needed using useTransition */}
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="p-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.size === orders.length && orders.length > 0}
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
                                {orders.length > 0 ? (
                                    orders.map((order) => (
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
                                                            <div className="relative">
                                                                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                                                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
                                                            </div>
                                                            {/* If we had an icon, it would go here, using a pseudo-element for now */}
                                                            <span className="font-bold text-xs">!</span>
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-xs font-bold text-gray-500">
                            Toplam {totalCount} kayıttan {(currentPage - 1) * 50 + 1}-{Math.min(currentPage * 50, totalCount)} arası gösteriliyor
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => router.push(pathname + '?' + createQueryString({ page: currentPage - 1 }))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {paginationRange().map(p => (
                                <button
                                    key={p}
                                    onClick={() => router.push(pathname + '?' + createQueryString({ page: p }))}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition ${currentPage === p
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                onClick={() => router.push(pathname + '?' + createQueryString({ page: currentPage + 1 }))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={() => router.refresh()}
                    isUnified={true}
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
