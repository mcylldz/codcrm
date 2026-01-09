'use client';

import { useState } from 'react';
import { createSupplier, createPurchase, confirmPurchase } from '@/app/extra-actions';
import { Plus, Truck, History, User, Phone, Package, DollarSign, Calendar, CheckCircle2, Clock } from 'lucide-react';

export default function SupplierDashboard({ suppliers, products, purchases }: { suppliers: any[], products: any[], purchases: any[] }) {
    const [activeTab, setActiveTab] = useState<'list' | 'purchases' | 'create'>('list');

    // Create Supplier State
    const [newSupplier, setNewSupplier] = useState({ company_name: '', contact_name: '', contact_phone: '', product_ids: [] as string[] });

    // Create Purchase State
    const [newPurchase, setNewPurchase] = useState({ supplier_id: '', product_id: '', amount: 0, price: 0, date: new Date().toISOString().split('T')[0] });

    const handleCreateSupplier = async () => {
        if (!newSupplier.company_name) return;
        const res = await createSupplier(newSupplier);
        if (res.success) {
            alert('Tedarikçi eklendi.');
            window.location.reload();
        }
    };

    const handleCreatePurchase = async () => {
        if (!newPurchase.supplier_id || !newPurchase.product_id || !newPurchase.amount) return;
        const res = await createPurchase(newPurchase);
        if (res.success) {
            alert('Satın alma işlemi başlatıldı (Yolda).');
            window.location.reload();
        }
    };

    const handleConfirm = async (id: string) => {
        if (!confirm('Ürünlerin stoğa girdiğini onaylıyor musunuz?')) return;
        const res = await confirmPurchase(id);
        if (res.success) {
            alert('Stok güncellendi.');
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex space-x-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`pb-2 px-4 font-bold text-sm transition-colors ${activeTab === 'list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Tedarikçi Listesi
                </button>
                <button
                    onClick={() => setActiveTab('purchases')}
                    className={`pb-2 px-4 font-bold text-sm transition-colors ${activeTab === 'purchases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Ticaret Geçmişi
                </button>
                <button
                    onClick={() => setActiveTab('create')}
                    className={`pb-2 px-4 font-bold text-sm transition-colors ${activeTab === 'create' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Yeni Kayıt
                </button>
            </div>

            {activeTab === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suppliers.map(s => (
                        <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                                    <Truck size={24} />
                                </div>
                                <span className="text-xs font-bold text-gray-400">ID: {s.id.slice(0, 8)}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900">{s.company_name}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
                                    <User size={14} /> <span>{s.contact_name}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
                                    <Phone size={14} /> <span>{s.contact_phone}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tedarik Edilen Ürünler</p>
                                <div className="flex flex-wrap gap-1">
                                    {s.supplier_products?.map((sp: any) => (
                                        <span key={sp.products.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-bold">
                                            {sp.products.name}
                                        </span>
                                    ))}
                                    {(!s.supplier_products || s.supplier_products.length === 0) && <span className="text-gray-400 text-xs italic">Belirtilmemiş</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'purchases' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tarih</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Firma</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Ürün</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Adet</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tutar</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Durum</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {purchases.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {new Date(p.date).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {p.suppliers?.company_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                        {p.products?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {p.amount} Adet
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {p.price} ₺
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold ${p.status === 'stoga_girdi' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {p.status === 'stoga_girdi' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                            <span>{p.status === 'stoga_girdi' ? 'Stoğa Girdi' : 'Yolda'}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {p.status === 'yolda' && (
                                            <button
                                                onClick={() => handleConfirm(p.id)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                                            >
                                                Stoğa Al
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'create' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Create Supplier */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                        <div className="flex items-center space-x-2 text-blue-600">
                            <Truck size={20} />
                            <h4 className="text-lg font-bold">Yeni Tedarikçi Ekle</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Firma Adı</label>
                                <input
                                    className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Örn: ABC Lojistik"
                                    value={newSupplier.company_name}
                                    onChange={e => setNewSupplier({ ...newSupplier, company_name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">İrtibat Kişi</label>
                                    <input
                                        className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ad Soyad"
                                        value={newSupplier.contact_name}
                                        onChange={e => setNewSupplier({ ...newSupplier, contact_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">İrtibat Tel</label>
                                    <input
                                        className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="05xx"
                                        value={newSupplier.contact_phone}
                                        onChange={e => setNewSupplier({ ...newSupplier, contact_phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Tedarik Ettiği Ürünler (Birden fazla seçilebilir)</label>
                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border rounded-xl p-3">
                                    {products.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                const current = newSupplier.product_ids;
                                                const next = current.includes(p.id) ? current.filter(id => id !== p.id) : [...current, p.id];
                                                setNewSupplier({ ...newSupplier, product_ids: next });
                                            }}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border ${newSupplier.product_ids.includes(p.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleCreateSupplier}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-[0.98]"
                        >
                            Tedarikçiyi Kaydet
                        </button>
                    </div>

                    {/* Create Purchase Trade */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                        <div className="flex items-center space-x-2 text-green-600">
                            <History size={20} />
                            <h4 className="text-lg font-bold">Yeni Alışveriş Girişi</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Tedarikçi Firma</label>
                                <select
                                    className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newPurchase.supplier_id}
                                    onChange={e => setNewPurchase({ ...newPurchase, supplier_id: e.target.value })}
                                >
                                    <option value="">Seçiniz...</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Ürün</label>
                                <select
                                    className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newPurchase.product_id}
                                    onChange={e => setNewPurchase({ ...newPurchase, product_id: e.target.value })}
                                >
                                    <option value="">Seçiniz...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Adet</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newPurchase.amount}
                                        onChange={e => setNewPurchase({ ...newPurchase, amount: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Toplam Fiyat</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newPurchase.price}
                                        onChange={e => setNewPurchase({ ...newPurchase, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700">Tarih</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newPurchase.date}
                                    onChange={e => setNewPurchase({ ...newPurchase, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCreatePurchase}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 shadow-md transition-all active:scale-[0.98]"
                        >
                            Ticaret Kaydını Başlat (Yolda)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
