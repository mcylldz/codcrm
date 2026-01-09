'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { STATUS_MAP } from '@/lib/utils';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrderSearchFilters({ products, initialFilters }: { products: any[], initialFilters: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(true);

    const [localFilters, setLocalFilters] = useState({
        startDate: initialFilters.startDate || '',
        endDate: initialFilters.endDate || '',
        status: initialFilters.status || [],
        excludeStatus: initialFilters.excludeStatus || [],
        product: initialFilters.product || [],
        excludeProduct: initialFilters.excludeProduct || [],
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
        });
        router.push(pathname);
    };

    const toggleArrayItem = (key: 'status' | 'excludeStatus' | 'product' | 'excludeProduct', value: string) => {
        setLocalFilters((prev) => {
            const current = prev[key] as string[];
            if (current.includes(value)) {
                return { ...prev, [key]: current.filter((item) => item !== value) };
            } else {
                return { ...prev, [key]: [...current, value] };
            }
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-t-xl"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center space-x-2 text-gray-700">
                    <Filter size={18} />
                    <span className="font-bold">Filtreleme Seçenekleri</span>
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {isOpen && (
                <div className="p-6 border-t border-gray-100 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Date Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-800">Tarih Aralığı</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="date"
                                    value={localFilters.startDate}
                                    onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    value={localFilters.endDate}
                                    onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Status (Include) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-800">Sipariş Durumu (Dahil Et)</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(STATUS_MAP).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleArrayItem('status', key)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${localFilters.status.includes(key)
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status (Exclude) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-800 text-red-700">Sipariş Durumu (Hariç Tut)</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(STATUS_MAP).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => toggleArrayItem('excludeStatus', key)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${localFilters.excludeStatus.includes(key)
                                                ? 'bg-red-600 border-red-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-600 hover:border-red-400'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                        {/* Product (Include) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-800">Ürün (Dahil Et)</label>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                                {products.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => toggleArrayItem('product', p.name)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${localFilters.product.includes(p.name)
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
                                            }`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product (Exclude) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-800 text-red-700">Ürün (Hariç Tut)</label>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                                {products.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => toggleArrayItem('excludeProduct', p.name)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${localFilters.excludeProduct.includes(p.name)
                                                ? 'bg-red-600 border-red-600 text-white'
                                                : 'bg-white border-gray-300 text-gray-600 hover:border-red-400'
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
