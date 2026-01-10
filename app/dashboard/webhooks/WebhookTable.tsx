'use client';

import { useState } from 'react';
import { createWebhookSource, deleteWebhookSource, updateMetaSettings } from '@/app/extra-actions';
import { Trash2, Copy, Link as LinkIcon, Plus, Facebook, ShieldCheck, Key, Save } from 'lucide-react';

export default function WebhookTable({ initialSources, products, metaSettings }: { initialSources: any[], products: any[], metaSettings: any }) {
    const [name, setName] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

    const [metaForm, setMetaForm] = useState({
        access_token: metaSettings?.access_token || '',
        business_id: metaSettings?.business_id || '',
        ad_account_id: metaSettings?.ad_account_id || ''
    });

    const handleCreate = async () => {
        if (!name || !selectedProduct) return alert('İsim ve Ürün seçiniz.');
        const res = await createWebhookSource(name, selectedProduct);
        if (res.success) {
            setName('');
            setSelectedProduct('');
            window.location.reload();
        } else {
            alert(res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        const res = await deleteWebhookSource(id);
        if (res.success) window.location.reload();
    };

    const handleMetaSave = async () => {
        const res = await updateMetaSettings(metaForm);
        if (res.success) {
            alert('Meta ayarları güncellendi.');
        } else {
            alert(res.error);
        }
    };

    const copyUrl = (id: string) => {
        const url = `${window.location.origin}/api/webhook/orders?source_id=${id}`;
        navigator.clipboard.writeText(url);
        alert('Link kopyalandı');
    }

    const inputClass = "w-full border-2 border-gray-100 p-3 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all";

    return (
        <div className="space-y-12">
            {/* Meta Integration Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 p-8 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-3 rounded-2xl">
                            <Facebook size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Meta Ads API Entegrasyonu</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Reklam harcamalarını çekmek için gereklidir</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-1">
                            <Key size={12} /> <span>Bearer Access Token</span>
                        </label>
                        <input
                            type="password"
                            className={inputClass}
                            value={metaForm.access_token}
                            onChange={e => setMetaForm({ ...metaForm, access_token: e.target.value })}
                            placeholder="EAAb..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-1">
                            <ShieldCheck size={12} /> <span>Business ID</span>
                        </label>
                        <input
                            className={inputClass}
                            value={metaForm.business_id}
                            onChange={e => setMetaForm({ ...metaForm, business_id: e.target.value })}
                            placeholder="123456789..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-1">
                            <LinkIcon size={12} /> <span>Ad Account ID</span>
                        </label>
                        <input
                            className={inputClass}
                            value={metaForm.ad_account_id}
                            onChange={e => setMetaForm({ ...metaForm, ad_account_id: e.target.value })}
                            placeholder="act_123..."
                        />
                    </div>
                </div>
                <div className="px-8 pb-8 flex justify-end">
                    <button
                        onClick={handleMetaSave}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-lg active:scale-95"
                    >
                        <Save size={16} /> <span>Ayarları Kaydet</span>
                    </button>
                </div>
            </div>

            {/* Webhook Sources Section */}
            <div className="space-y-6">
                <div className="flex items-center space-x-2">
                    <LinkIcon className="text-blue-600" size={24} />
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Webhook Kaynakları</h3>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Kaynak Adı</label>
                        <input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="Örn: FB - Tabanlık v2" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Eşleşecek Ürün</label>
                        <select className={inputClass} value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                            <option value="">Seçiniz...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleCreate} className="bg-gray-900 text-white h-[52px] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center space-x-2 shadow-lg active:scale-95">
                        <Plus size={18} /> <span>Yeni Bağlantı</span>
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
                            <tr>
                                <th className="px-8 py-5 text-left">Kaynak</th>
                                <th className="px-8 py-5 text-left">Eşleşen Ürün</th>
                                <th className="px-8 py-5 text-left">Webhook URL</th>
                                <th className="px-8 py-5 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {initialSources.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5 font-black text-gray-900 underline decoration-blue-200 underline-offset-4">{s.name}</td>
                                    <td className="px-8 py-5 font-bold text-blue-600">
                                        <span className="bg-blue-50 px-3 py-1 rounded-lg">{s.products?.name}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl border border-gray-100 w-fit">
                                            <code className="text-[10px] text-gray-500 truncate max-w-[200px]">.../api/webhook/orders?source_id={s.id}</code>
                                            <button onClick={() => copyUrl(s.id)} className="p-1.5 hover:bg-white rounded-lg transition-colors text-blue-600">
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {initialSources.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold italic underline-offset-4">Tanımlı webhook kaynağı bulunamadı.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
