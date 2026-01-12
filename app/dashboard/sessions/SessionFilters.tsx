'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, Plus, Minus, Search } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'teyit_bekleniyor', label: 'Teyit Bekleniyor', color: 'orange' },
    { value: 'ulasilamadi', label: 'Ulaşılamadı', color: 'gray' },
    { value: 'teyit_alindi', label: 'Teyit Alındı', color: 'green' },
    { value: 'kabul_etmedi', label: 'Kabul Etmedi', color: 'red' },
    { value: 'iade_donduruldu', label: 'İade Döndü', color: 'purple' },
];

export default function SessionFilters({ products }: { products: any[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [includeStatus, setIncludeStatus] = useState<string[]>(searchParams.getAll('includeStatus') || []);
    const [excludeStatus, setExcludeStatus] = useState<string[]>(searchParams.getAll('excludeStatus') || []);
    const [includeProducts, setIncludeProducts] = useState<string[]>(searchParams.getAll('includeProduct') || []);
    const [excludeProducts, setExcludeProducts] = useState<string[]>(searchParams.getAll('excludeProduct') || []);

    const toggleIncludeStatus = (status: string) => {
        setIncludeStatus(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
        if (!includeStatus.includes(status)) {
            setExcludeStatus(prev => prev.filter(s => s !== status));
        }
    };

    const toggleExcludeStatus = (status: string) => {
        setExcludeStatus(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
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
        if (search) params.set('search', search);
        includeStatus.forEach(s => params.append('includeStatus', s));
        excludeStatus.forEach(s => params.append('excludeStatus', s));
        includeProducts.forEach(p => params.append('includeProduct', p));
        excludeProducts.forEach(p => params.append('excludeProduct', p));
        router.push(`/dashboard/sessions?${params.toString()}`);
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSearch('');
        setIncludeStatus([]);
        setExcludeStatus([]);
        setIncludeProducts([]);
        setExcludeProducts([]);
        router.push('/dashboard/sessions');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                        <Filter size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Seans Filtreleri</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Siparişleri ayıkla ve yönet</p>
                    </div>
                </div>
                <button onClick={clearFilters} className="text-sm font-bold text-gray-400 hover:text-red-500 transition flex items-center space-x-1 uppercase tracking-widest">
                    <X size={16} /> <span>Sıfırla</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Müşteri adı veya telefon numarası ile ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Başlangıç Tarihi</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Bitiş Tarihi</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Status Filter */}
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block ml-1">Durum Filtreleri (Dahil / Hariç)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {STATUS_OPTIONS.map(status => {
                        const isIncluded = includeStatus.includes(status.value) || (status.value === 'teyit_alindi' && searchParams.get('single') !== null);
                        const isExcluded = excludeStatus.includes(status.value);
                        return (
                            <div key={status.value} className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => toggleIncludeStatus(status.value)}
                                    className={`flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${isIncluded
                                        ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200'
                                        : 'bg-white border-gray-100 text-gray-400 hover:border-green-400 hover:text-green-600'
                                        }`}
                                >
                                    <Plus size={14} className="inline mr-1 -mt-0.5" />
                                    {status.label}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleExcludeStatus(status.value)}
                                    className={`p-3 rounded-xl border-2 transition-all ${isExcluded
                                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200'
                                        : 'bg-white border-gray-100 text-gray-400 hover:border-red-400 hover:text-red-600'
                                        }`}
                                >
                                    <Minus size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Product Filter */}
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block ml-1">Ürün Filtreleri (Dahil / Hariç)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {products.map(product => {
                        const isIncluded = includeProducts.includes(product.name);
                        const isExcluded = excludeProducts.includes(product.name);
                        return (
                            <div key={product.id} className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => toggleIncludeProduct(product.name)}
                                    className={`flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${isIncluded
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-400 hover:text-indigo-600'
                                        }`}
                                >
                                    <Plus size={14} className="inline mr-1 -mt-0.5" />
                                    {product.name}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleExcludeProduct(product.name)}
                                    className={`p-3 rounded-xl border-2 transition-all ${isExcluded
                                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200'
                                        : 'bg-white border-gray-100 text-gray-400 hover:border-red-400 hover:text-red-600'
                                        }`}
                                >
                                    <Minus size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button
                onClick={applyFilters}
                className="w-full bg-gray-900 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-800 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all shadow-xl"
            >
                Filtreleri Uygula
            </button>
        </div>
    );
}
