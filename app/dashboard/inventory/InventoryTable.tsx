'use client';

import { useState } from 'react';
import { updateProduct, createProduct } from '@/app/inventory-actions';
import { Plus, Save, X, Edit, Package, DollarSign, AlertTriangle } from 'lucide-react';

export default function InventoryTable({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', stock: 0, cost: 0 });

    const startEdit = (prod: any) => {
        setEditingId(prod.id);
        setEditForm({ ...prod });
    };

    const saveEdit = async () => {
        const res = await updateProduct(editingId!, { stock: editForm.stock, cost: editForm.cost });
        if (res.success) {
            setProducts(products.map(p => p.id === editingId ? { ...p, stock: editForm.stock, cost: editForm.cost } : p));
            setEditingId(null);
        } else {
            alert(res.error);
        }
    };

    const handleAdd = async () => {
        if (!newProduct.name) return;
        const res = await createProduct(newProduct);
        if (res.success) {
            window.location.reload();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-2">
                    <Package className="text-blue-600" size={20} />
                    <span className="font-bold text-gray-800 tracking-tight">{products.length} Farklı Ürün</span>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                >
                    <Plus size={20} /> <span>Yeni Ürün Tanımla</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-end shadow-inner animate-in fade-in slide-in-from-top-4">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-blue-900 mb-1 uppercase tracking-wider">Ürün Adı</label>
                        <input
                            className="w-full border-2 border-blue-100 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                            value={newProduct.name}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="Örn: Akıllı Tabanlık v2"
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-bold text-blue-900 mb-1 uppercase tracking-wider">Stok</label>
                        <input
                            type="number"
                            className="w-full border-2 border-blue-100 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                            value={newProduct.stock}
                            onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-bold text-blue-900 mb-1 uppercase tracking-wider">Maliyet (₺)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full border-2 border-blue-100 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                            value={newProduct.cost}
                            onChange={e => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="flex space-x-2 w-full md:w-auto">
                        <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors">Kaydet</button>
                        <button onClick={() => setIsAdding(false)} className="bg-white text-gray-400 p-2.5 rounded-xl border-2 border-blue-100 hover:text-red-500 transition-colors"><X size={20} /></button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 uppercase text-[10px] font-extrabold text-gray-500 tracking-widest">
                        <tr>
                            <th className="px-8 py-5 text-left">Ürün Bilgisi</th>
                            <th className="px-8 py-5 text-left">Stok Durumu</th>
                            <th className="px-8 py-5 text-left">Birim Maliyet</th>
                            <th className="px-8 py-5 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {products.map((prod) => (
                            <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            <Package size={20} />
                                        </div>
                                        <span className="font-extrabold text-gray-900 text-sm tracking-tight">{prod.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    {editingId === prod.id ? (
                                        <input type="number" className="border-2 border-blue-200 rounded-lg px-3 py-1.5 w-24 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: parseInt(e.target.value) })} />
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-sm font-extrabold ${prod.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {prod.stock} <span className="text-[10px] text-gray-400 ml-1">ADET</span>
                                            </span>
                                            {prod.stock < 10 && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    {editingId === prod.id ? (
                                        <input type="number" step="0.01" className="border-2 border-blue-200 rounded-lg px-3 py-1.5 w-24 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.cost} onChange={e => setEditForm({ ...editForm, cost: parseFloat(e.target.value) })} />
                                    ) : (
                                        <div className="flex items-center text-gray-900 font-bold text-sm">
                                            <DollarSign size={14} className="text-gray-400 mr-0.5" />
                                            {prod.cost} ₺
                                        </div>
                                    )}
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap text-right">
                                    {editingId === prod.id ? (
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={saveEdit} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-all"><Save size={18} /></button>
                                            <button onClick={() => setEditingId(null)} className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 shadow-sm transition-all"><X size={18} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => startEdit(prod)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100">
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
    );
}
