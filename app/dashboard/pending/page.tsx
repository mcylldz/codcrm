import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Link from 'next/link';

// We want to fetch fresh data on every request
export const dynamic = 'force-dynamic';

export default async function PendingOrdersPage() {
    const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('status', 'teyit_bekleniyor')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="text-red-500">Hata: {error.message}</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Teyit Bekleyen Siparişler</h2>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {orders?.length || 0} Sipariş
                </span>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bölge</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders?.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {order.name} {order.surname}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.phone}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.city} / {order.district}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.product} ({order.package_id} ad.)
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    {order.total_price} ₺
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* We can link to a detail page, or use a client component for direct action. 
                      Requirements check: "Teyit Seansı" handles the actions mostly.
                      "Teyit bekleyenler siparişleri ayrı bir sayfada listelenmelidir."
                      Maybe this page is just readonly list OR shortcut to processing?
                      The user wants "Teyit Seansı Başlat" -> "Gün Seç" -> "Liste".
                      Does "Teyit Bekleyenler" page need editing? "Sipariş listeleme ve güncelleme" section mentions Teyit Seansı mostly.
                      But presumably we can edit here too. I'll add an 'Edit' link.
                  */}
                                    <Link href={`/dashboard/sessions?single=${order.id}`} className="text-blue-600 hover:text-blue-900">
                                        İncele
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {orders?.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                    Bekleyen sipariş bulunmamaktadır.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
