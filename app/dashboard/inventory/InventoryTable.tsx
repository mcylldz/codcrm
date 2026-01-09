'use client';

import { useState } from 'react';
import { updateProduct, createProduct } from '@/app/inventory-actions';
import { Plus, Save, X, Edit } from 'lucide-react';

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
        await updateProduct(editingId!, { stock: editForm.stock, cost: editForm.cost });
        setProducts(products.map(p => p.id === editingId ? { ...p, stock: editForm.stock, cost: editForm.cost } : p));
        setEditingId(null);
    };

    const handleAdd = async () => {
        if (!newProduct.name) return;
        const res = await createProduct(newProduct);
        if (res.success) {
            // We'd ideally re-fetch or push optimistic, but for now reload or wait revalidate
            window.location.reload();
        } else {
            alert(res.error);
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center space-x-2">
                    <Plus size={18} /> <span>Yeni Ürün Ekle</span>
                </button>
            </div>

            {isAdding && (
                <div className="bg-blue-50 p-4 rounded mb-4 flex space-x-2 items-end border border-blue-200">
                    <div>
                        <label className="block text-xs font-bold text-gray-700">Ürün Adı</label>
                        <input className="border p-2 rounded" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700">Stok</label>
                        <input type="number" className="border p-2 rounded w-24" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700">Maliyet</label>
                        <input type="number" step="0.01" className="border p-2 rounded w-24" value={newProduct.cost} onChange={e => setNewProduct({ ...newProduct, cost: parseFloat(e.target.value) })} />
                    </div>
                    <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded mb-0.5">Kaydet</button>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün Adı</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Adedi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim Maliyet</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((prod) => (
                            <tr key={prod.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{prod.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingId === prod.id ? (
                                        <input type="number" className="border rounded px-2 py-1 w-24" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: parseInt(e.target.value) })} />
                                    ) : (
                                        <span className={prod.stock < 10 ? 'text-red-600 font-bold' : 'text-gray-900'}>{prod.stock}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {editingId === prod.id ? (
                                        <input type="number" step="0.01" className="border rounded px-2 py-1 w-24" value={editForm.cost} onChange={e => setEditForm({ ...editForm, cost: parseFloat(e.target.value) })} />
                                    ) : `${prod.cost} ₺`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                    {editingId === prod.id ? (
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={saveEdit}><Save size={18} className="text-green-600" /></button>
                                            <button onClick={() => setEditingId(null)}><X size={18} className="text-gray-500" /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => startEdit(prod)}><Edit size={18} className="text-blue-600" /></button>
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
