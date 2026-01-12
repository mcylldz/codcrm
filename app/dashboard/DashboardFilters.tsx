'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Filter, Calendar, Package, Search, X } from 'lucide-react';

export default function DashboardFilters({ products, basePath = '/dashboard' }: { products: any[], basePath?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(searchParams.get('startDate') || today);
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || today);
    const [selectedProducts, setSelectedProducts] = useState<string[]>(searchParams.getAll('product') || []);

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        selectedProducts.forEach(p => params.append('product', p));
        router.push(`${basePath}?${params.toString()}`);
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedProducts([]);
        router.push(basePath);
    };

    const toggleProduct = (name: string) => {
        setSelectedProducts(prev =>
            prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-900">
                    <Filter size={20} className="text-blue-600" />
                    <h3 className="text-lg font-extrabold uppercase tracking-tight">Analiz Filtreleri</h3>
                </div>
                <button
                    onClick={clearFilters}
                    className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center space-x-1"
                >
                    <X size={16} /> <span>Temizle</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date Range */}
                <div className="space-y-2 col-span-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-1">
                        <Calendar size={12} /> <span>Tarih Aralığı</span>
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="text-gray-300">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Product Multi-select */}
                <div className="space-y-2 col-span-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-1">
                        <Package size={12} /> <span>Ürün Seçimi</span>
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                        {products.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => toggleProduct(p.name)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedProducts.includes(p.name)
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400'
                                    }`}
                            >
                                {p.name}
                            </button>
                        ))}
                        {products.length === 0 && <span className="text-gray-400 text-xs italic">Ürün bulunamadı</span>}
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <button
                    onClick={applyFilters}
                    className="w-full md:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center space-x-2 shadow-lg active:scale-95"
                >
                    <Search size={16} /> <span>Raporu Güncelle</span>
                </button>
            </div>
        </div>
    );
}
