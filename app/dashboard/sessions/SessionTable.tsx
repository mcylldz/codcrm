'use client';

import { useState } from 'react';
import { updateOrder } from '@/app/actions';
import * as XLSX from 'xlsx';
import { FileDown, Edit, Save, X } from 'lucide-react';
import { getStatusLabel, STATUS_MAP } from '@/lib/utils';

export default function SessionTable({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Status Options from the map
    const statusOptions = Object.keys(STATUS_MAP);

    const handleStatusChange = async (id: string, newStatus: string) => {
        const res = await updateOrder(id, { status: newStatus });
        if (res.success) {
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } else {
            alert('Statü güncellenirken hata oluştu!');
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
        const rows = orders.map(order => ({
            'HEDEF KODU': '',
            'MÜŞTERİ BARKODU': '',
            'ADI SOYADI': (order.name + ' ' + order.surname).trim(),
            'TELEFON1': order.phone,
            'TELEFON2': '',
            'İLÇE': order.district,
            'İL': order.city,
            'ADRES': order.address,
            'ADET': order.package_id,
            'ÜRÜN': order.product,
            'KİLO': 0,
            'DESİ': 1,
            'FİYAT': order.total_price,
            'AÇIKLAMA': order.description || '',
            'ÖDEME ŞEKLİ': order.payment_method === 'cod' ? 'Kapıda Ödeme' : 'Tahsilatsız',
            'SIPARIS NO': '', // MUST BE EMPTY
            'ALIM SAATİ': '', // MUST BE EMPTY
            'TESLİM SAATİ': '',
            'SATICI': 'EPADEM',
            'FATURA KESİLSİN': '',
            'FATURA KDV': 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Onaylananlar");
        XLSX.writeFile(workbook, `Onay_Listesi_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-4">
            {orders.length > 0 && (
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{orders.length} Sipariş Listelendi</h3>
                    <button
                        onClick={exportExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-colors"
                    >
                        <FileDown size={20} />
                        <span>Onay Excelini İndir</span>
                    </button>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs tracking-wider">
                        <tr>
                            <th className="px-4 py-4 text-left">Durum</th>
                            <th className="px-4 py-4 text-left">Müşteri</th>
                            <th className="px-4 py-4 text-left">ÜrÜn</th>
                            <th className="px-4 py-4 text-left">Adres</th>
                            <th className="px-4 py-4 text-left">Tutar</th>
                            <th className="px-4 py-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {orders.map((order) => {
                            const isEditing = editingId === order.id;
                            return (
                                <tr key={order.id} className={`${isEditing ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <select
                                            value={isEditing ? editForm.status : order.status}
                                            onChange={(e) => isEditing ? setEditForm({ ...editForm, status: e.target.value }) : handleStatusChange(order.id, e.target.value)}
                                            className={`border rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none ${(isEditing ? editForm.status : order.status) === 'teyit_alindi' ? 'text-green-700 bg-green-50 border-green-200' :
                                                    (isEditing ? editForm.status : order.status) === 'ulasilamadi' ? 'text-orange-700 bg-orange-50 border-orange-200' :
                                                        (isEditing ? editForm.status : order.status) === 'kabul_etmedi' ? 'text-red-700 bg-red-50 border-red-200' :
                                                            'text-blue-700 bg-blue-50 border-blue-200'
                                                }`}
                                        >
                                            {statusOptions.map(opt => <option key={opt} value={opt}>{getStatusLabel(opt)}</option>)}
                                        </select>
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {isEditing ? (
                                            <div className="flex flex-col space-y-1">
                                                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="border rounded px-2 py-1 w-full text-xs" />
                                                <input value={editForm.surname} onChange={e => setEditForm({ ...editForm, surname: e.target.value })} className="border rounded px-2 py-1 w-full text-xs" />
                                                <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="border rounded px-2 py-1 w-full text-xs" />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="font-bold text-gray-900">{order.name} {order.surname}</div>
                                                <div className="text-xs text-gray-500">{order.phone}</div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-4">
                                        {isEditing ? (
                                            <div className="flex flex-col space-y-1">
                                                <input value={editForm.product} onChange={e => setEditForm({ ...editForm, product: e.target.value })} className="border rounded px-2 py-1 w-full text-xs" />
                                                <input type="number" value={editForm.package_id} onChange={e => setEditForm({ ...editForm, package_id: parseInt(e.target.value) })} className="border rounded px-2 py-1 w-full text-xs" />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="font-bold text-gray-800">{order.product}</div>
                                                <div className="text-xs text-gray-500 font-semibold">{order.package_id} Adet</div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-4">
                                        {isEditing ? (
                                            <div className="flex flex-col space-y-1">
                                                <input value={editForm.city} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className="border rounded px-2 py-1 w-full text-xs" placeholder="İl" />
                                                <input value={editForm.district} onChange={e => setEditForm({ ...editForm, district: e.target.value })} className="border rounded px-2 py-1 w-full text-xs" placeholder="İlçe" />
                                                <textarea value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className="border rounded px-2 py-1 w-full text-xs h-12" placeholder="Adres" />
                                            </div>
                                        ) : (
                                            <div className="max-w-xs">
                                                <div className="item-font font-bold text-gray-700">{order.city} / {order.district}</div>
                                                <div className="text-xs text-gray-500 truncate" title={order.address}>{order.address}</div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-900">
                                        {isEditing ? (
                                            <input type="number" value={editForm.total_price} onChange={e => setEditForm({ ...editForm, total_price: parseFloat(e.target.value) })} className="border rounded px-2 py-1 w-24 text-xs" />
                                        ) : `${order.total_price} ₺`}
                                    </td>

                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={saveEdit} disabled={loading} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                    <Save size={16} />
                                                </button>
                                                <button onClick={cancelEdit} className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEdit(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                                                <Edit size={18} />
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
