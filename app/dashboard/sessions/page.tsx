import { getProducts, getOrders } from '@/app/actions';
import SessionTable from './SessionTable';
import SessionFilters from './SessionFilters';
import ReturnUpload from './ReturnUpload';
import { PhoneCall } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SessionsPage({ searchParams }: { searchParams: Promise<any> }) {
    const products = await getProducts();
    const sParams = await searchParams;

    const includeStatus = sParams.includeStatus ? (Array.isArray(sParams.includeStatus) ? sParams.includeStatus : [sParams.includeStatus]) : undefined;
    const excludeStatus = sParams.excludeStatus ? (Array.isArray(sParams.excludeStatus) ? sParams.excludeStatus : [sParams.excludeStatus]) : undefined;
    const includeProduct = sParams.includeProduct ? (Array.isArray(sParams.includeProduct) ? sParams.includeProduct : [sParams.includeProduct]) : undefined;
    const excludeProduct = sParams.excludeProduct ? (Array.isArray(sParams.excludeProduct) ? sParams.excludeProduct : [sParams.excludeProduct]) : undefined;

    const filters = {
        startDate: sParams.startDate,
        endDate: sParams.endDate,
        status: includeStatus,
        excludeStatus: excludeStatus,
        product: includeProduct,
        excludeProduct: excludeProduct,
    };

    const hasActiveFilter = sParams.startDate || sParams.endDate || includeStatus || excludeStatus || includeProduct || excludeProduct;
    const orders = hasActiveFilter ? await getOrders(filters) : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-white/95 shadow-sm">
                <div className="max-w-[1800px] mx-auto px-6 py-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <PhoneCall className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight text-white">Teyit Seansları</h1>
                            <p className="text-sm text-gray-500 font-semibold">Sipariş filtreleme ve yönetim paneli</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-6 py-8 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <SessionFilters products={products || []} />
                    </div>
                    <div className="lg:col-span-1">
                        <ReturnUpload />
                    </div>
                </div>

                {hasActiveFilter ? (
                    <SessionTable orders={orders} />
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <PhoneCall size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Filtre Uygulayın</h3>
                        <p className="text-gray-500">Siparişleri görüntülemek için yukarıdaki filtrelerden en az birini seçin.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
