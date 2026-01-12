'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { STATUS_MAP } from '@/lib/utils';
import { Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';

export default function OrderSearchFilters({ products, initialFilters }: { products: any[], initialFilters: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(true);

    const [localFilters, setLocalFilters] = useState({
        startDate: initialFilters.startDate || '',
        endDate: initialFilters.endDate || '',
        status: Array.isArray(initialFilters.status) ? initialFilters.status : (initialFilters.status ? [initialFilters.status] : []),
        excludeStatus: Array.isArray(initialFilters.excludeStatus) ? initialFilters.excludeStatus : (initialFilters.excludeStatus ? [initialFilters.excludeStatus] : []),
        product: Array.isArray(initialFilters.product) ? initialFilters.product : (initialFilters.product ? [initialFilters.product] : []),
        excludeProduct: Array.isArray(initialFilters.excludeProduct) ? initialFilters.excludeProduct : (initialFilters.excludeProduct ? [initialFilters.excludeProduct] : []),
        search: initialFilters.search || '',
    });

    const createQueryString = useCallback(
        (params: Record<string, string | string[] | undefined>) => {
            const newParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((v) => newParams.append(key, v));
                } else if (value) {
                    newParams.set(key, value);
                }
            });
            return newParams.toString();
        },
        []
    );

    const applyFilters = () => {
        const qs = createQueryString(localFilters);
        router.push(`${pathname}?${qs}`);
    };

    const clearFilters = () => {
        setLocalFilters({
            startDate: '',
            endDate: '',
            status: [],
            excludeStatus: [],
            product: [],
            excludeProduct: [],
            search: '',
        });
        router.push(pathname);
    };

    const toggleArrayItem = (key: 'status' | 'excludeStatus' | 'product' | 'excludeProduct', value: string) => {
        setLocalFilters((prev) => {
            const current = (prev as any)[key] as string[];
            if (current.includes(value)) {
                return { ...prev, [key]: current.filter((item) => item !== value) };
            } else {
                return { ...prev, [key]: [...current, value] };
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center space-x-3 text-gray-900">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                        <Filter size={20} />
                    </div>
                    <div>
                        <h3 className="font-black uppercase tracking-tight">Gelişmiş Filtreleme</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Siparişlerini detaylı ara</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    {!isOpen && localFilters.search && (
                        <span className="text-xs font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                            Arama Aktif: {localFilters.search}
                        </span>
                    )}
                    {isOpen ? <ChevronUp size={24} className="text-gray-400" /> : <ChevronDown size={24} className="text-gray-400" />}
                </div>
            </div>

            {isOpen && (
                <div className="p-8 border-t border-gray-100 space-y-8 animate-in slide-in-from-top-4 duration-300">
                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Müşteri adı, soyadı veya telefon numarası ile ara..."
                            value={localFilters.search}
                            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Date Filter */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tarih Aralığı</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="date"
                                    value={localFilters.startDate}
                                    onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <span className="text-gray-300 font-black">-</span>
                                <input
                                    type="date"
                                    value={localFilters.endDate}
                                    onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Status (Include) */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sipariş Durumu (Dahil Et)</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(STATUS_MAP).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleArrayItem('status', key)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${localFilters.status.includes(key)
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-blue-400 hover:text-blue-600'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status (Exclude) */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-red-500">Durum (Hariç Tut)</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(STATUS_MAP).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleArrayItem('excludeStatus', key)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${localFilters.excludeStatus.includes(key)
                                            ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200'
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-red-400 hover:text-red-600'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                        {/* Product (Include) */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ürün (Dahil Et)</label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {products.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => toggleArrayItem('product', p.name)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${localFilters.product.includes(p.name)
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-400 hover:text-indigo-600'
                                            }`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product (Exclude) */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-red-500">Ürün (Hariç Tut)</label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {products.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => toggleArrayItem('excludeProduct', p.name)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${localFilters.excludeProduct.includes(p.name)
                                            ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200'
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-red-400 hover:text-red-600'
                                            }`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700"
                        >
                            Filtreleri Temizle
                        </button>
                        <button
                            onClick={applyFilters}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-sm"
                        >
                            Filtreleri Uygula
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
