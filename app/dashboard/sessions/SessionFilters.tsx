'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Plus, Minus } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'teyit_bekleniyor', label: 'Teyit Bekleniyor', color: 'orange' },
    { value: 'ulasilamadi', label: 'Ulaşılamadı', color: 'gray' },
    { value: 'teyit_alindi', label: 'Teyit Alındı', color: 'green' },
    { value: 'kabul_etmedi', label: 'Kabul Etmedi', color: 'red' },
];

export default function SessionFilters({ products }: { products: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
    const [includeStatus, setIncludeStatus] = useState<string[]>(searchParams.getAll('includeStatus') || []);
    const [excludeStatus, setExcludeStatus] = useState<string[]>(searchParams.getAll('excludeStatus') || []);
    const [includeProducts, setIncludeProducts] = useState<string[]>(searchParams.getAll('includeProduct') || []);
    const [excludeProducts, setExcludeProducts] = useState<string[]>(searchParams.getAll('excludeProduct') || []);

    const toggleIncludeStatus = (status: string) => {
        setIncludeStatus(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
        // Remove from exclude if adding to include
        if (!includeStatus.includes(status)) {
            setExcludeStatus(prev => prev.filter(s => s !== status));
        }
    };

    const toggleExcludeStatus = (status: string) => {
        setExcludeStatus(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
        // Remove from include if adding to exclude
        if (!excludeStatus.includes(status)) {
            setIncludeStatus(prev => prev.filter(s => s !== status));
        }
    };

    const toggleIncludeProduct = (product: string) => {
        setIncludeProducts(prev =>
            prev.includes(product) ? prev.filter(p => p !== product) : [...prev, product]
        );
        if (!includeProducts.includes(product)) {
            setExcludeProducts(prev => prev.filter(p => p !== product));
        }
    };

    const toggleExcludeProduct = (product: string) => {
        setExcludeProducts(prev =>
            prev.includes(product) ? prev.filter(p => p !== product) : [...prev, product]
        );
        if (!excludeProducts.includes(product)) {
            setIncludeProducts(prev => prev.filter(p => p !== product));
        }
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        includeStatus.forEach(s => params.append('includeStatus', s));
        excludeStatus.forEach(s => params.append('excludeStatus', s));
        includeProducts.forEach(p => params.append('includeProduct', p));
        excludeProducts.forEach(p => params.append('excludeProduct', p));
        router.push(`/dashboard/sessions?${params.toString()}`);
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setIncludeStatus([]);
        setExcludeStatus([]);
        setIncludeProducts([]);
        setExcludeProducts([]);
        router.push('/dashboard/sessions');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Filter size={20} className="text-blue-600" />
                    <h3 className="text-lg font-black uppercase tracking-tight text-gray-900">Filtreleme</h3>
                </div>
                <button onClick={clearFilters} className="text-sm font-bold text-gray-400 hover:text-red-500 transition flex items-center space-x-1">
                    <X size={16} /> <span>Temizle</span>
                </button>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Başlangıç Tarihi</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Bitiş Tarihi</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Status Filter */}
            <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Durum Filtresi</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {STATUS_OPTIONS.map(status => {
                        const isIncluded = includeStatus.includes(status.value);
                        const isExcluded = excludeStatus.includes(status.value);
                        return (
                            <div key={status.value} className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => toggleIncludeStatus(status.value)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition ${isIncluded
                                            ? 'bg-green-100 border-green-500 text-green-700'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-green-400'
                                        }`}
                                >
                                    <Plus size={12} className="inline mr-1" />
                                    {status.label}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleExcludeStatus(status.value)}
                                    className={`p-2 rounded-lg border transition ${isExcluded
                                            ? 'bg-red-100 border-red-500 text-red-700'
                                            : 'bg-white border-gray-200 text-gray-400 hover:border-red-400'
                                        }`}
                                >
                                    <Minus size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Product Filter */}
            <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Ürün Filtresi</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {products.map(product => {
                        const isIncluded = includeProducts.includes(product.name);
                        const isExcluded = excludeProducts.includes(product.name);
                        return (
                            <div key={product.id} className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => toggleIncludeProduct(product.name)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition ${isIncluded
                                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-blue-400'
                                        }`}
                                >
                                    <Plus size={12} className="inline mr-1" />
                                    {product.name}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleExcludeProduct(product.name)}
                                    className={`p-2 rounded-lg border transition ${isExcluded
                                            ? 'bg-red-100 border-red-500 text-red-700'
                                            : 'bg-white border-gray-200 text-gray-400 hover:border-red-400'
                                        }`}
                                >
                                    <Minus size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-lg transition-all"
            >
                Filtreleri Uygula
            </button>
        </div>
    );
}
