'use client';

import { useState } from 'react';
import { createWebhookSource, deleteWebhookSource } from '@/app/extra-actions';
import { Trash2, Copy, Link as LinkIcon, Plus } from 'lucide-react';

export default function WebhookTable({ initialSources, products }: { initialSources: any[], products: any[] }) {
    const [name, setName] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');

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

    const copyUrl = (id: string) => {
        const url = `${window.location.origin}/api/webhook/orders?source_id=${id}`;
        navigator.clipboard.writeText(url);
        alert('Link kopyalandı: ' + url);
    }

    return (
        <div>
            <div className="bg-white p-4 rounded shadow mb-6 flex items-end space-x-4">
                <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700">Kaynak Adı (Örn: Facebook Tabanlık Kampanyası)</label>
                    <input className="border w-full p-2 rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Tüm Kampanya" />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700">Eşleşecek Ürün</label>
                    <select className="border w-full p-2 rounded" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                        <option value="">Seçiniz...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <button onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2">
                    <Plus size={18} /> <span>Oluştur</span>
                </button>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaynak</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Webhook URL</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {initialSources.map(s => (
                            <tr key={s.id}>
                                <td className="px-6 py-4">{s.name}</td>
                                <td className="px-6 py-4 font-semibold">{s.products?.name}</td>
                                <td className="px-6 py-4 font-mono text-xs text-blue-600 truncate max-w-xs">
                                    .../api/webhook/orders?source_id={s.id}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => copyUrl(s.id)} className="text-gray-600 hover:text-blue-600" title="Kopyala">
                                        <Copy size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700" title="Sil">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
