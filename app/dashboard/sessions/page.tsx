import { getProducts, getOrders } from '@/app/actions';
import SessionTable from './SessionTable';
import { STATUS_MAP } from '@/lib/utils';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SessionsPage({ searchParams }: { searchParams: any }) {
    const products = await getProducts();
    const date = searchParams.date || '';
    const status = searchParams.status || '';
    const product = searchParams.product || '';

    // Only fetch if at least one filter is applied (as per requirement: initially empty)
    let orders = [];
    const isActive = date || status || product;

    if (isActive) {
        orders = await getOrders({
            startDate: date,
            endDate: date,
            status: status ? [status] : undefined,
            product: product ? [product] : undefined
        });
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900">Teyit Seans Başlat</h2>
                <p className="text-gray-500 mt-1 font-medium">Lütfen işlemek istediğiniz sipariş kriterlerini seçin.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <form className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Tarih</label>
                        <input
                            type="date"
                            name="date"
                            defaultValue={date}
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Durum</label>
                        <select
                            name="status"
                            defaultValue={status}
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                        >
                            <option value="">Tümü</option>
                            {Object.entries(STATUS_MAP).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Ürün</label>
                        <select
                            name="product"
                            defaultValue={product}
                            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium"
                        >
                            <option value="">Tümü</option>
                            {products.map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 font-bold transition-all shadow-lg active:scale-95"
                    >
                        <Search size={20} />
                        <span>Siparişleri Getir</span>
                    </button>
                </form>
            </div>

            {isActive ? (
                <SessionTable initialOrders={orders || []} />
            ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-20 text-center space-y-4">
                    <div className="bg-white p-4 rounded-full shadow-sm w-fit mx-auto">
                        <Search size={40} className="text-gray-300" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-gray-800">Henüz Seçim Yapılmadı</h3>
                        <p className="text-gray-500 font-medium">Siparişleri listelemek için yukarıdaki filtreleri kullanın.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
