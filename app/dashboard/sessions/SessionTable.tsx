'use client';

import { useState } from 'react';
import { updateOrder, deleteOrder } from '@/app/actions';
import { Edit2, Trash2, Phone, MapPin, Package, User, Calendar, X, Check, AlertTriangle } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    teyit_bekleniyor: { label: 'Teyit Bekleniyor', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    ulasilamadi: { label: 'Ulaşılamadı', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    teyit_alindi: { label: 'Teyit Alındı', color: 'bg-green-100 text-green-700 border-green-200' },
    kabul_etmedi: { label: 'Kabul Etmedi', color: 'bg-red-100 text-red-700 border-red-200' },
    iade_donduruldu: { label: 'İade Döndü', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function SessionTable({ orders }: { orders: any[] }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleEdit = (order: any) => {
        setEditingId(order.id);
        setEditData({
            product: order.product || '',
            package_id: order.package_id || 1,
            total_price: order.total_price || 0,
            status: order.status || 'teyit_bekleniyor',
        });
    };

    const handleSave = async () => {
        if (!editingId) return;
        await updateOrder(editingId, editData);
        setEditingId(null);
        window.location.reload();
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        const result = await deleteOrder(deletingId);
        if (result.success) {
            setDeletingId(null);
            window.location.reload();
        } else {
            alert('Silme işlemi başarısız: ' + result.error);
        }
    };

    if (orders.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold">Seçilen kriterlere uygun sipariş bulunamadı.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
                    <h3 className="text-xl font-black">Sipariş Listesi</h3>
                    <p className="text-sm text-gray-300 mt-1">{orders.length} Sipariş Bulundu</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Müşteri</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Telefon</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Adres</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Ürün</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Fiyat</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Durum</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-black shadow-md">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{order.name} {order.surname}</p>
                                                <p className="text-[10px] text-gray-500 flex items-center">
                                                    <Calendar size={10} className="mr-1" />
                                                    {new Date(order.created_at).toLocaleString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <PhoneZoom phone={order.phone} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start space-x-2 text-sm text-gray-700">
                                            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold">{order.city} / {order.district}</p>
                                                <p className="text-xs text-gray-500 line-clamp-2">{order.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                                            <Package size={14} className="text-blue-600" />
                                            <span className="font-bold text-blue-900 text-sm">{order.product}</span>
                                            <span className="text-xs font-black text-blue-600">x{order.package_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <p className="text-lg font-black text-gray-900">{order.total_price} ₺</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black border ${STATUS_MAP[order.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                                            {STATUS_MAP[order.status]?.label || order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(order)}
                                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(order.id)}
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Edit2 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">Sipariş Düzenle</h3>
                                    <p className="text-sm text-blue-100">Sipariş bilgilerini güncelleyin</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingId(null)} className="p-2 hover:bg-white/20 rounded-lg transition">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Ürün</label>
                                    <input
                                        type="text"
                                        value={editData.product}
                                        onChange={(e) => setEditData({ ...editData, product: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Paket Adedi</label>
                                    <input
                                        type="number"
                                        value={editData.package_id}
                                        onChange={(e) => setEditData({ ...editData, package_id: parseInt(e.target.value) })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Toplam Fiyat</label>
                                    <input
                                        type="number"
                                        value={editData.total_price}
                                        onChange={(e) => setEditData({ ...editData, total_price: parseFloat(e.target.value) })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Durum</label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setEditingId(null)}
                                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition flex items-center space-x-2"
                            >
                                <Check size={18} />
                                <span>Kaydet</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">Siparişi Sil</h3>
                                    <p className="text-sm text-red-100">Bu işlem geri alınamaz!</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <p className="text-gray-700 font-semibold text-center">
                                Bu siparişi silmek istediğinizden emin misiniz?
                            </p>
                            <p className="text-sm text-gray-500 text-center mt-2">
                                Teyitli sipariş ise stok otomatik olarak geri eklenecektir.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-lg transition flex items-center space-x-2"
                            >
                                <Trash2 size={18} />
                                <span>Sil</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function PhoneZoom({ phone }: { phone: string }) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        const timeout = setTimeout(() => setIsZoomed(true), 2000);
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        setIsZoomed(false);
    };

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-green-100 transition"
            >
                <Phone size={14} className="text-green-600" />
                <span className={`font-black text-green-900 transition-all duration-300 ${isZoomed ? 'text-2xl' : 'text-sm'}`}>
                    {phone}
                </span>
            </div>
            {isZoomed && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 border-4 border-green-400">
                    <p className="text-4xl font-black tracking-wider">{phone}</p>
                </div>
            )}
        </div>
    );
}
