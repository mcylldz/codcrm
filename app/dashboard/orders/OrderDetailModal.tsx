'use client';

import { useState } from 'react';
import { X, Save, Trash2, Phone, MapPin, Package, CreditCard, Calendar, Info, Clock, ExternalLink, RefreshCw, Edit } from 'lucide-react';
import { STATUS_MAP, getStatusLabel } from '@/lib/utils';
import { updateOrder, deleteOrder } from '@/app/actions';

interface OrderDetailModalProps {
    order: any;
    onClose: () => void;
    onUpdate: () => void;
}

export default function OrderDetailModal({ order, onClose, onUpdate }: OrderDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ ...order });

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await updateOrder(order.id, form);
            if (res.success) {
                setIsEditing(false);
                onUpdate();
            } else {
                alert('Hata: ' + res.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;
        setLoading(true);
        try {
            const res = await deleteOrder(order.id);
            if (res.success) {
                onClose();
                onUpdate();
            } else {
                alert('Hata: ' + res.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gray-900 p-8 text-white shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center space-x-3">
                                <h2 className="text-3xl font-black tracking-tight">{form.name} {form.surname}</h2>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${form.status === 'teyit_alindi' ? 'bg-green-500 text-white' :
                                    form.status === 'kabul_etmedi' ? 'bg-red-500 text-white' :
                                        form.status === 'iade_donduruldu' ? 'bg-purple-500 text-white' :
                                            'bg-orange-500 text-white'
                                    }`}>
                                    {getStatusLabel(form.status)}
                                </span>
                            </div>
                            <p className="text-gray-400 font-bold text-sm flex items-center">
                                <Clock size={14} className="mr-1.5" />
                                {new Date(form.created_at).toLocaleString('tr-TR')} tarihinde oluşturuldu
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={28} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
                    {/* Customer & Shipping Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <SectionTitle icon={<Info className="text-blue-500" />} title="Müşteri Bilgileri" />
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Ad" value={form.name} isEditing={isEditing} onChange={(v: any) => setForm({ ...form, name: v })} />
                                <Field label="Soyad" value={form.surname} isEditing={isEditing} onChange={(v: any) => setForm({ ...form, surname: v })} />
                            </div>
                            <Field label="Telefon" value={form.phone} isEditing={isEditing} icon={<Phone size={14} />} onChange={(v: any) => setForm({ ...form, phone: v })} />
                        </div>

                        <div className="space-y-6">
                            <SectionTitle icon={<MapPin className="text-red-500" />} title="Teslimat Adresi" />
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Şehir" value={form.city} isEditing={isEditing} onChange={(v: any) => setForm({ ...form, city: v })} />
                                <Field label="İlçe" value={form.district} isEditing={isEditing} onChange={(v: any) => setForm({ ...form, district: v })} />
                            </div>
                            <Field label="Adres" value={form.address} isEditing={isEditing} type="textarea" onChange={(v: any) => setForm({ ...form, address: v })} />
                        </div>
                    </div>

                    {/* Product & Payment Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                        <div className="space-y-6">
                            <SectionTitle icon={<Package className="text-orange-500" />} title="Ürün Detayları" />
                            <Field label="Ürün" value={form.product} isEditing={isEditing} onChange={(v: any) => setForm({ ...form, product: v })} />
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Adet / Paket" value={form.package_id} isEditing={isEditing} type="number" onChange={(v: any) => setForm({ ...form, package_id: parseInt(v) })} />
                                <Field label="Birim Fiyat" value={form.base_price} isEditing={isEditing} type="number" onChange={(v: any) => setForm({ ...form, base_price: parseFloat(v) })} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <SectionTitle icon={<CreditCard className="text-green-500" />} title="Ödeme & Finans" />
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Toplam Tutar" value={form.total_price} isEditing={isEditing} type="number" icon={<span className="text-xs font-black mr-1">₺</span>} onChange={(v: any) => setForm({ ...form, total_price: parseFloat(v) })} />
                                <Field label="Ödeme Metodu" value={form.payment_method} isEditing={isEditing} onChange={(v: any) => setForm({ ...form, payment_method: v })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Kargo Maliyeti" value={form.shipping_cost} isEditing={isEditing} type="number" onChange={(v: any) => setForm({ ...form, shipping_cost: parseFloat(v) })} />
                                {form.status === 'iade_donduruldu' && (
                                    <Field label="İade Maliyeti" value={form.return_cost} isEditing={isEditing} type="number" onChange={(v: any) => setForm({ ...form, return_cost: parseFloat(v) })} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-3">
                            <Calendar size={20} className="text-gray-400" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sipariş Kaynağı</p>
                                <p className="text-sm font-bold text-gray-700">{form.order_source || 'Manuel'}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-3">
                            <Info size={20} className="text-gray-400" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">A/B Test Varyantı</p>
                                <p className="text-sm font-bold text-gray-700">{form.ab_test_variation || '-'}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-3">
                            <Clock size={20} className="text-gray-400" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Son Güncelleme</p>
                                <p className="text-sm font-bold text-gray-700">{new Date(form.updated_at || form.created_at).toLocaleDateString('tr-TR')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Update (Always visible edit for status) */}
                    <div className="bg-blue-50 p-8 rounded-[32px] border-2 border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <RefreshCw size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-blue-900 uppercase tracking-tight">Sipariş Durumunu Güncelle</h4>
                                <p className="text-blue-600/80 font-bold text-sm tracking-tight">Siparişin operasyonel sürecini buradan yönetebilirsiniz.</p>
                            </div>
                        </div>
                        <select
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                            className="w-full md:w-64 bg-white border-2 border-blue-200 rounded-2xl px-6 py-4 text-sm font-black text-blue-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none text-center"
                        >
                            {Object.entries(STATUS_MAP).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 shrink-0 flex justify-between items-center">
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex items-center space-x-2 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-50 px-6 py-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        <span>Siparişi Sil</span>
                    </button>

                    <div className="flex items-center space-x-4">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center space-x-2 shadow-xl hover:-translate-y-0.5 active:scale-95"
                            >
                                <Edit size={16} />
                                <span>Düzenle</span>
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-white border-2 border-gray-200 text-gray-500 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-xl shadow-blue-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                    <span>Değişiklikleri Kaydet</span>
                                </button>
                            </>
                        )}
                        {/* Status update is always saved via Save button, but if we only changed status we might want a quick save */}
                        {!isEditing && form.status !== order.status && (
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-green-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all flex items-center space-x-2 shadow-xl shadow-green-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                            >
                                <Save size={16} />
                                <span>Durumu Kaydet</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ icon, title }: { icon: any, title: string }) {
    return (
        <div className="flex items-center space-x-2 pb-2 border-b-2 border-gray-50">
            {icon}
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{title}</h3>
        </div>
    );
}

function Field({ label, value, isEditing, onChange, type = 'text', icon }: any) {
    const inputClass = "w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300";

    if (isEditing) {
        return (
            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
                {type === 'textarea' ? (
                    <textarea
                        className={inputClass + " min-h-[100px] resize-none"}
                        value={value || ''}
                        onChange={e => onChange(e.target.value)}
                    />
                ) : (
                    <div className="relative">
                        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
                        <input
                            type={type}
                            className={inputClass + (icon ? " pl-10" : "")}
                            value={value || ''}
                            onChange={e => onChange(e.target.value)}
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-1 group">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</p>
            <div className="bg-white border-2 border-transparent group-hover:border-gray-100 p-3 rounded-xl transition-all flex items-center">
                {icon && <div className="text-gray-400 mr-2">{icon}</div>}
                <p className="text-sm font-bold text-gray-800 break-words">{value || '-'}</p>
            </div>
        </div>
    );
}
