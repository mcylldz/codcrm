'use client';

import { useState } from 'react';
import { updateProduct, createProduct } from '@/app/inventory-actions';
import { createPurchase, confirmPurchase, addProductCampaign, deleteProductCampaign } from '@/app/extra-actions';
import {
    Plus,
    Save,
    X,
    Edit,
    Package,
    DollarSign,
    AlertTriangle,
    ArrowDownCircle,
    History,
    Truck,
    Tag,
    Trash2
} from 'lucide-react';

export default function InventoryTable({ initialProducts, suppliers }: { initialProducts: any[], suppliers: any[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', cost: 0 });

    const [isIntaking, setIsIntaking] = useState(false);
    const [intakeForm, setIntakeForm] = useState({
        supplier_id: '',
        product_id: '',
        amount: 0,
        unit_price: 0,
        shipping_cost: 0,
        date: new Date().toISOString().split('T')[0]
    });

    const [campaignDrawer, setCampaignDrawer] = useState<any>(null);
    const [newCode, setNewCode] = useState('');

    const startEdit = (prod: any) => {
        setEditingId(prod.id);
        setEditForm({ ...prod });
    };

    const saveEdit = async () => {
        const res = await updateProduct(editingId!, { cost: editForm.cost });
        if (res.success) {
            setProducts(products.map(p => p.id === editingId ? { ...p, cost: editForm.cost } : p));
            setEditingId(null);
        } else {
            alert(res.error);
        }
    };

    const handleAdd = async () => {
        if (!newProduct.name) return;
        const res = await createProduct({ ...newProduct, stock: 0 });
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error);
        }
    };

    const handleIntake = async () => {
        if (!intakeForm.supplier_id || !intakeForm.product_id || !intakeForm.amount) {
            alert('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        const total_price = (intakeForm.amount * intakeForm.unit_price) + intakeForm.shipping_cost;

        const res = await createPurchase({
            ...intakeForm,
            total_price,
            status: 'stoga_girdi'
        });

        if (res.success) {
            alert('Stok girişi kaydedildi. Sayfa yenileniyor...');
            window.location.reload();
        } else {
            alert(res.error);
        }
    };

    const handleAddCampaign = async () => {
        if (!newCode) return;
        const res = await addProductCampaign(campaignDrawer.id, newCode);
        if (res.success) {
            setNewCode('');
            window.location.reload();
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        const res = await deleteProductCampaign(id);
        if (res.success) window.location.reload();
    };

    const inputClass = "w-full border-2 border-gray-100 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-bold transition-all";

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex space-x-2">
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-2">
                        <Package className="text-blue-600" size={20} />
                        <span className="font-bold text-gray-800 tracking-tight">{products.length} Ürün</span>
                    </div>
                </div>

                <div className="flex space-x-3 w-full md:w-auto">
                    <button
                        onClick={() => { setIsIntaking(!isIntaking); setIsAdding(false); }}
                        className="flex-1 md:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                    >
                        <ArrowDownCircle size={20} /> <span>Hızlı Stok Girişi</span>
                    </button>
                    <button
                        onClick={() => { setIsAdding(!isAdding); setIsIntaking(false); }}
                        className="flex-1 md:flex-none bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center justify-center space-x-2 font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                    >
                        <Plus size={20} /> <span>Yeni Ürün</span>
                    </button>
                </div>
            </div>

            {/* QUICK FORMS (SAME AS BEFORE) */}
            {isAdding && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-end animate-in fade-in slide-in-from-top-4">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-black text-gray-400 mb-1 uppercase tracking-widest">Ürün Adı</label>
                        <input className={inputClass} value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Kafa Lambası v3" />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-black text-gray-400 mb-1 uppercase tracking-widest">Maliyet (₺)</label>
                        <input type="number" step="0.01" className={inputClass} value={newProduct.cost} onChange={e => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) })} />
                    </div>
                    <div className="flex space-x-2 w-full md:w-auto">
                        <button onClick={handleAdd} className="flex-1 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors">Tanımla</button>
                        <button onClick={() => setIsAdding(false)} className="bg-white text-gray-400 p-2.5 rounded-xl border-2 border-gray-200 hover:text-red-500 transition-colors"><X size={20} /></button>
                    </div>
                </div>
            )}

            {isIntaking && (
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center space-x-2 text-blue-800">
                        <ArrowDownCircle size={24} />
                        <h3 className="text-xl font-black uppercase tracking-tight">Yeni Stok Alımı</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-blue-400 mb-1 uppercase tracking-widest">Tedarikçi</label>
                            <select className={inputClass} value={intakeForm.supplier_id} onChange={e => setIntakeForm({ ...intakeForm, supplier_id: e.target.value })}>
                                <option value="">Seçiniz...</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-blue-400 mb-1 uppercase tracking-widest">Ürün</label>
                            <select className={inputClass} value={intakeForm.product_id} onChange={e => setIntakeForm({ ...intakeForm, product_id: e.target.value })}>
                                <option value="">Seçiniz...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-blue-400 mb-1 uppercase tracking-widest">Adet</label>
                            <input type="number" className={inputClass} value={intakeForm.amount} onChange={e => setIntakeForm({ ...intakeForm, amount: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-blue-400 mb-1 uppercase tracking-widest">Birim Fiyat</label>
                            <input type="number" step="0.01" className={inputClass} value={intakeForm.unit_price} onChange={e => setIntakeForm({ ...intakeForm, unit_price: parseFloat(e.target.value) })} />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-blue-100">
                        <div className="text-blue-900 font-bold">
                            Hesaplanan Toplam: <span className="text-2xl font-black">{(intakeForm.amount * intakeForm.unit_price).toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="flex space-x-2 w-full md:w-auto">
                            <button onClick={handleIntake} className="flex-1 md:px-12 bg-blue-600 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg active:scale-95">Stoğa Al</button>
                            <button onClick={() => setIsIntaking(false)} className="bg-white text-gray-400 px-4 rounded-2xl border-2 border-blue-100 hover:text-red-500 transition-colors font-bold text-xs uppercase">Vazgeç</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
                            <tr>
                                <th className="px-8 py-5 text-left">Ürün Bilgisi</th>
                                <th className="px-8 py-5 text-center">Kampanya Kodları</th>
                                <th className="px-8 py-5 text-center">T. Alınan</th>
                                <th className="px-8 py-5 text-center">T. Satılan</th>
                                <th className="px-8 py-5 text-center">Mevcut Stok</th>
                                <th className="px-8 py-5 text-left">Birim Maliyet</th>
                                <th className="px-8 py-5 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {products.map((prod) => (
                                <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors border border-gray-100">
                                                <Package size={20} />
                                            </div>
                                            <span className="font-black text-gray-900 text-sm tracking-tight">{prod.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center whitespace-nowrap">
                                        <button
                                            onClick={() => setCampaignDrawer(prod)}
                                            className="flex items-center space-x-1.5 mx-auto bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 text-[10px] font-black text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all uppercase tracking-widest shadow-sm"
                                        >
                                            <Tag size={12} />
                                            <span>Kodları Yönet ({prod.campaigns?.length || 0})</span>
                                        </button>
                                    </td>
                                    <td className="px-8 py-5 text-center whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-600">{prod.totalPurchased || 0}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center whitespace-nowrap">
                                        <span className="text-sm font-bold text-blue-600">{prod.totalSold || 0}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center whitespace-nowrap">
                                        <div className="flex items-center justify-center space-x-2">
                                            <span className={`text-base font-black px-3 py-1 rounded-xl ${prod.calculatedStock < 0 ? 'bg-red-50 text-red-600' :
                                                prod.calculatedStock < 10 ? 'bg-orange-50 text-orange-600' :
                                                    'bg-green-50 text-green-600'
                                                }`}>
                                                {prod.calculatedStock}
                                            </span>
                                            {prod.calculatedStock < 10 && <AlertTriangle size={14} className="text-orange-500" />}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        {editingId === prod.id ? (
                                            <input type="number" step="0.01" className="border-2 border-blue-200 rounded-xl px-3 py-1.5 w-24 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.cost} onChange={e => setEditForm({ ...editForm, cost: parseFloat(e.target.value) })} />
                                        ) : (
                                            <div className="flex items-center text-gray-900 font-bold text-sm">
                                                <DollarSign size={14} className="text-gray-400 mr-0.5" />
                                                {prod.cost} ₺
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {editingId === prod.id ? (
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={saveEdit} className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md transition-all"><Save size={18} /></button>
                                                <button onClick={() => setEditingId(null)} className="p-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 shadow-md transition-all"><X size={18} /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEdit(prod)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100">
                                                <Edit size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CAMPAIGN CODES DRAWER / MODAL */}
            {campaignDrawer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <Tag className="text-blue-400" />
                                <h3 className="text-xl font-black uppercase tracking-tight">Kampanya Kodları</h3>
                            </div>
                            <button onClick={() => setCampaignDrawer(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="flex items-center space-x-2">
                                <input
                                    className={inputClass}
                                    placeholder="Kampanya Kodu (Örn: tabanlik_pro_reklam)"
                                    value={newCode}
                                    onChange={e => setNewCode(e.target.value)}
                                />
                                <button
                                    onClick={handleAddCampaign}
                                    className="bg-blue-600 text-white p-3.5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mevcut Kodlar</h4>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                    {campaignDrawer.campaigns?.map((c: any) => (
                                        <div key={c.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                                            <span className="font-bold text-gray-700">{c.campaign_code}</span>
                                            <button
                                                onClick={() => handleDeleteCampaign(c.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {campaignDrawer.campaigns?.length === 0 && (
                                        <p className="text-sm font-bold text-gray-400 italic">Henüz kod eklenmemiş.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
