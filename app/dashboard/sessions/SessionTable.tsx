'use client';

import { useState } from 'react';
import { updateOrder } from '@/app/actions';
import * as XLSX from 'xlsx';
import { FileDown, Edit, Save, X } from 'lucide-react';

export default function SessionTable({ initialOrders, selectedDate }: { initialOrders: any[], selectedDate: string }) {
    const [orders, setOrders] = useState(initialOrders);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Status Options
    const statuses = ['teyit_bekleniyor', 'teyit_alindi', 'ulasilamadi', 'kabul_etmedi'];

    const handleStatusChange = async (id: string, newStatus: string) => {
        // Optimistic update
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));

        const res = await updateOrder(id, { status: newStatus });
        if (!res.success) {
            alert('Statü güncellenirken hata oluştu!');
            // Revert could be here, but simpler to just alert.
        }
    };

    const startEdit = (order: any) => {
        setEditingId(order.id);
        setEditForm({ ...order });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async () => {
        setLoading(true);
        // Sanitize numeric fields
        const payload = { ...editForm };
        delete payload.id;
        delete payload.created_at;

        const res = await updateOrder(editingId!, payload);
        if (res.success) {
            setOrders(orders.map(o => o.id === editingId ? { ...o, ...payload } : o));
            setEditingId(null);
        } else {
            alert('Güncelleme hatası: ' + res.error);
        }
        setLoading(false);
    };

    const exportExcel = () => {
        // Filter only confirmed
        const confirmedOrders = orders.filter(o => o.status === 'teyit_alindi');

        if (confirmedOrders.length === 0) {
            alert('Listede "teyit_alindi" statüsünde sipariş bulunmamaktadır.');
            return;
        }

        const rows = confirmedOrders.map(order => ({
            'hedef_kodu': '',
            'musteri_barkodu': '',
            'adi_soyadi*': (order.name + ' ' + order.surname).trim(),
            'telefon1*': order.phone,
            'telefon2': '',
            'ilce*': order.district,
            'il*': order.city,
            'adres*': order.address,
            'adet*': order.package_id,
            'urun*': order.product,
            'kilo': 0,
            'desi': 1,
            'fiyat*': order.total_price,
            'aciklama*': order.description || '',
            'odeme_sekli': order.payment_method === 'cod' ? 'Kapıda Ödeme' : 'Tahsilatsız',
            'siparis_no': order.id,
            'alım_saati': order.order_timestamp || order.created_at,
            'teslim_saati': '',
            'satici': 'EPADEM',
            'fatura_kesilsin': '',
            'fatura_kdv': 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Siparisler");
        XLSX.writeFile(workbook, `Siparisler_${selectedDate}.xlsx`);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={exportExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center space-x-2"
                >
                    <FileDown size={20} />
                    <span>Onaylananları İndir (Excel)</span>
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Durum</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Müşteri</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">İletişim</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ürün/Adres</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Tutar</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Açıklama</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {orders.map((order) => {
                            const isEditing = editingId === order.id;

                            return (
                                <tr key={order.id} className={isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                    {/* Status */}
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <select
                                            value={isEditing ? editForm.status : order.status}
                                            onChange={(e) => isEditing ? setEditForm({ ...editForm, status: e.target.value }) : handleStatusChange(order.id, e.target.value)}
                                            className={`border rounded px-2 py-1 text-sm ${(isEditing ? editForm.status : order.status) === 'teyit_alindi' ? 'text-green-700 bg-green-100 border-green-300' :
                                                    (isEditing ? editForm.status : order.status) === 'ulasilamadi' ? 'text-orange-700 bg-orange-100 border-orange-300' :
                                                        (isEditing ? editForm.status : order.status) === 'kabul_etmedi' ? 'text-red-700 bg-red-100 border-red-300' :
                                                            'text-gray-700 bg-gray-100'
                                                }`}
                                        >
                                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-4 py-4">
                                        {isEditing ? (
                                            <div className="space-y-1">
                                                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="border rounded px-1 w-full" placeholder="Ad" />
                                                <input value={editForm.surname} onChange={e => setEditForm({ ...editForm, surname: e.target.value })} className="border rounded px-1 w-full" placeholder="Soyad" />
                                            </div>
                                        ) : (
                                            <div className="font-medium text-gray-900">{order.name} {order.surname}</div>
                                        )}
                                    </td>

                                    {/* Phone */}
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {isEditing ? (
                                            <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="border rounded px-1 w-full" />
                                        ) : order.phone}
                                    </td>

                                    {/* Product/City */}
                                    <td className="px-4 py-4">
                                        {isEditing ? (
                                            <div className="space-y-1">
                                                <input value={editForm.product} onChange={e => setEditForm({ ...editForm, product: e.target.value })} className="border rounded px-1 w-full" placeholder="Ürün" />
                                                <input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className="border rounded px-1 w-full" placeholder="İl" />
                                                <input value={editForm.district} onChange={e => setEditForm({ ...editForm, district: e.target.value })} className="border rounded px-1 w-full" placeholder="İlçe" />
                                                <textarea value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="border rounded px-1 w-full h-16" placeholder="Adres" />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="font-semibold">{order.product} ({order.package_id} ad.)</div>
                                                <div className="text-gray-500 text-xs">{order.city}/{order.district}</div>
                                                <div className="text-gray-500 text-xs truncate max-w-xs" title={order.address}>{order.address}</div>
                                            </div>
                                        )}
                                    </td>

                                    {/* Price */}
                                    <td className="px-4 py-4 whitespace-nowrap font-bold">
                                        {isEditing ? (
                                            <input type="number" value={editForm.total_price} onChange={e => setEditForm({ ...editForm, total_price: parseFloat(e.target.value) })} className="border rounded px-1 w-24" />
                                        ) : `${order.total_price} ₺`}
                                    </td>

                                    {/* Description */}
                                    <td className="px-4 py-4">
                                        {isEditing ? (
                                            <textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="border rounded px-1 w-full" placeholder="Açıklama" />
                                        ) : (
                                            <div className="text-gray-600 italic text-xs">{order.description}</div>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={saveEdit} disabled={loading} className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                                                    <Save size={16} />
                                                </button>
                                                <button onClick={cancelEdit} className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEdit(order)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                                <Edit size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
