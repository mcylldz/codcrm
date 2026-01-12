'use client';

import { useState, useEffect } from 'react';
import { updateOrder, deleteOrder } from '@/app/actions';
import { Edit2, Trash2, Phone, MapPin, Package, User, Calendar, X, Check, AlertTriangle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    teyit_bekleniyor: { label: 'Teyit Bekleniyor', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    ulasilamadi: { label: 'Ulaşılamadı', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    teyit_alindi: { label: 'Teyit Alındı', color: 'bg-green-100 text-green-700 border-green-200' },
    kabul_etmedi: { label: 'Kabul Etmedi', color: 'bg-red-100 text-red-700 border-red-200' },
    iade_donduruldu: { label: 'İade Döndü', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function SessionTable({ orders: initialOrders }: { orders: any[] }) {
    const [localOrders, setLocalOrders] = useState<any[]>(initialOrders);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        setLocalOrders(initialOrders);
        setSelectedIds(new Set()); // Reset selection on new orders
    }, [initialOrders]);

    const toggleSelectAll = () => {
        if (selectedIds.size === localOrders.length && localOrders.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(localOrders.map(o => o.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleEdit = (order: any) => {
        setEditingId(order.id);
        setEditData({
            product: order.product || '',
            package_id: order.package_id || 1,
            total_price: order.total_price || 0,
            status: order.status || 'teyit_bekleniyor',
            return_cost: order.return_cost || 0,
        });
    };

    const handleSave = async () => {
        if (!editingId) return;
        const res = await updateOrder(editingId, editData);
        if (res) {
            setLocalOrders(prev => prev.map(o => o.id === editingId ? { ...o, ...editData } : o));
            setEditingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        const result = await deleteOrder(deletingId);
        if (result.success) {
            setLocalOrders(prev => prev.filter(o => o.id !== deletingId));
            const newSelected = new Set(selectedIds);
            newSelected.delete(deletingId);
            setSelectedIds(newSelected);
            setDeletingId(null);
        } else {
            alert('Silme işlemi başarısız: ' + result.error);
        }
    };

    const exportToExcel = () => {
        const selectedOrders = localOrders.filter(o => selectedIds.has(o.id));
        if (selectedOrders.length === 0) {
            alert('Lütfen dışa aktarmak için en az bir sipariş seçin.');
            return;
        }

        const exportData = selectedOrders.map(o => ({
            'HEDEF KODU': '',
            'MÜŞTERİ BARKODU': '',
            'ADI SOYADI': `${o.name || ''} ${o.surname || ''}`.toUpperCase().trim() || 'BELİRTİLMEMİŞ',
            'TELEFON1': o.phone || '',
            'TELEFON2': '',
            'İLÇE': (o.district || '').toUpperCase().trim(),
            'İL': (o.city || '').toUpperCase().trim(),
            'ADRES': (o.address || '').toUpperCase().trim(),
            'ADET': o.package_id || 1,
            'ÜRÜN': (o.product || '').toUpperCase().trim(),
            'KİLO': 0,
            'DESİ': 1,
            'FİYAT': o.total_price || 0,
            'AÇIKLAMA': '',
            'ÖDEME ŞEKLİ': 'KAPIDA ÖDEME',
            'SIPARIS NO': o.id.slice(0, 8),
            'ALIM SAATİ': '',
            'TESLİM SAATİ': '',
            'SATICI': 'EPADEM',
            'FATURA KESİLSİN': '',
            'FATURA KDV': 0
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Siparişler");
        XLSX.writeFile(wb, `siparisler_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (localOrders.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-bold">Seçilen kriterlere uygun sipariş bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white flex justify-between items-center text-white">
                    <div>
                        <h3 className="text-xl font-black text-white">Sipariş Listesi</h3>
                        <p className="text-sm text-gray-300 mt-1 font-bold">{localOrders.length} Sipariş | {selectedIds.size} Seçili</p>
                    </div>
                    <button
                        onClick={exportToExcel}
                        disabled={selectedIds.size === 0}
                        className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black flex items-center space-x-2 transition shadow-lg uppercase text-xs tracking-widest ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                        <Download size={18} />
                        <span>Seçilenleri İndir</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.size === localOrders.length && localOrders.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Müşteri</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Telefon</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Adres</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Ürün</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Fiyat</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Durum</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {localOrders.map((order: any) => (
                                <tr
                                    key={order.id}
                                    className={`hover:bg-blue-50/40 transition-colors group cursor-pointer ${selectedIds.has(order.id) ? 'bg-blue-50/60' : ''}`}
                                    onClick={() => toggleSelect(order.id)}
                                >
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(order.id)}
                                            onChange={() => toggleSelect(order.id)}
                                            className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-black shadow-md">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{order.name} {order.surname}</p>
                                                <p className="text-[10px] text-gray-500 flex items-center font-bold">
                                                    <Calendar size={10} className="mr-1" />
                                                    {new Date(order.created_at).toLocaleString('tr-TR')}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <PhoneZoom phone={order.phone} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start space-x-2 text-sm text-gray-700">
                                            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-gray-800">{order.city} / {order.district}</p>
                                                <p className="text-xs text-gray-500 font-medium line-clamp-1">{order.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                                            <Package size={14} className="text-blue-600" />
                                            <span className="font-black text-blue-900 text-sm whitespace-nowrap">{order.product}</span>
                                            <span className="text-xs font-black text-blue-600">x{order.package_id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <p className="text-lg font-black text-gray-900">{order.total_price} ₺</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${STATUS_MAP[order.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                                            {STATUS_MAP[order.status]?.label || order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(order)}
                                                className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(order.id)}
                                                className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center"
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
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                                    <Edit2 size={24} />
                                </div>
                                <div className="text-white">
                                    <h3 className="text-xl font-black uppercase tracking-tight">Siparişi Düzenle</h3>
                                    <p className="text-sm text-blue-100 font-bold opacity-80">Gerekli güncellemeleri yapın</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingId(null)} className="p-2 hover:bg-white/20 rounded-xl transition text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ürün Bilgisi</label>
                                    <input
                                        type="text"
                                        value={editData.product}
                                        onChange={(e) => setEditData({ ...editData, product: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Paket Adedi</label>
                                    <input
                                        type="number"
                                        value={editData.package_id}
                                        onChange={(e) => setEditData({ ...editData, package_id: parseInt(e.target.value) })}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ödeme Tutarı</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={editData.total_price}
                                            onChange={(e) => setEditData({ ...editData, total_price: parseFloat(e.target.value) })}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm pr-12"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-400">₺</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sipariş Durumu</label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                    >
                                        {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                                            <option key={key} value={key} className="font-bold">{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {editData.status === 'iade_donduruldu' && (
                                <div className="p-6 bg-purple-50 rounded-[32px] border-2 border-purple-100 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-purple-900 uppercase tracking-tight">İade Maliyeti</h4>
                                            <p className="text-purple-600/80 font-bold text-xs tracking-tight">Bu iade için oluşan ek kargo/operasyon maliyetini girin.</p>
                                        </div>
                                    </div>
                                    <div className="relative w-48">
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={editData.return_cost}
                                            onChange={(e) => setEditData({ ...editData, return_cost: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-white border-2 border-purple-200 rounded-2xl px-5 py-4 text-sm font-black text-purple-900 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all shadow-sm pr-12 text-center"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-purple-400">₺</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-50/50 border-t border-gray-100 p-8 flex justify-end space-x-4">
                            <button
                                onClick={() => setEditingId(null)}
                                className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-all border-2 border-transparent"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center space-x-3"
                            >
                                <Check size={20} />
                                <span>Değişiklikleri Kaydet</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-md">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Emin misiniz?</h3>
                            <p className="text-red-100 font-bold mt-2">Bu işlem kalıcıdır ve geri alınamaz!</p>
                        </div>
                        <div className="p-10 text-center">
                            <p className="text-gray-600 font-bold leading-relaxed">
                                Bu siparişi sistemden tamamen silmek istediğinizden emin misiniz?
                                <span className="block mt-2 text-red-500 text-xs">Teyitli sipariş ise stok otomatik geri eklenir.</span>
                            </p>
                        </div>
                        <div className="p-8 pt-0 flex flex-col space-y-3">
                            <button
                                onClick={handleDelete}
                                className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-500/20 transition-all"
                            >
                                EVET, SİL
                            </button>
                            <button
                                onClick={() => setDeletingId(null)}
                                className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all"
                            >
                                HAYIR, VAZGEÇ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
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
                className="inline-flex items-center space-x-2 bg-green-50 border-2 border-green-100 rounded-xl px-4 py-2.5 cursor-pointer hover:bg-green-100 transition-all shadow-sm"
            >
                <Phone size={14} className="text-green-600" />
                <span className={`font-black text-green-900 transition-all duration-300 tracking-wide ${isZoomed ? 'text-2xl' : 'text-sm'}`}>
                    {phone}
                </span>
            </div>
            {isZoomed && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-green-600 text-white px-10 py-6 rounded-3xl shadow-[0_20px_50px_rgba(22,163,74,0.4)] z-50 border-4 border-green-400 animate-in zoom-in duration-200">
                    <p className="text-5xl font-black tracking-widest drop-shadow-lg">{phone}</p>
                </div>
            )}
        </div>
    );
}
