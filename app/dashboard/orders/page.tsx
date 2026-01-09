import { getOrders, getProducts } from '@/app/actions';
import OrderSearchFilters from './OrderSearchFilters';
import { getStatusLabel } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({ searchParams }: { searchParams: any }) {
    const products = await getProducts();

    // Parse filters from searchParams
    const filters = {
        status: searchParams.status ? (Array.isArray(searchParams.status) ? searchParams.status : [searchParams.status]) : undefined,
        excludeStatus: searchParams.excludeStatus ? (Array.isArray(searchParams.excludeStatus) ? searchParams.excludeStatus : [searchParams.excludeStatus]) : undefined,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        product: searchParams.product ? (Array.isArray(searchParams.product) ? searchParams.product : [searchParams.product]) : undefined,
        excludeProduct: searchParams.excludeProduct ? (Array.isArray(searchParams.excludeProduct) ? searchParams.excludeProduct : [searchParams.excludeProduct]) : undefined,
    };

    const orders = await getOrders(filters);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {orders?.length || 0} Sipariş Bulundu
                </span>
            </div>

            <OrderSearchFilters products={products} initialFilters={searchParams} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tarih</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Müşteri</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bölge</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ürün</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tutar</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {orders?.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {new Date(order.created_at).toLocaleString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">{order.name} {order.surname}</div>
                                        <div className="text-xs text-gray-500">{order.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === 'teyit_alindi' ? 'bg-green-100 text-green-700' :
                                                order.status === 'ulasilamadi' ? 'bg-orange-100 text-orange-700' :
                                                    order.status === 'kabul_etmedi' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                            }`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {order.city} / {order.district}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="font-medium">{order.product}</div>
                                        <div className="text-xs text-gray-500">{order.package_id} Adet</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {order.total_price} ₺
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <Link href={`/dashboard/sessions?single=${order.id}`} className="text-blue-600 font-semibold hover:text-blue-800 underline">
                                            Detay
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(!orders || orders.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Kriterlere uygun sipariş bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
