import { getOrders, getProducts } from '@/app/actions';
import OrderSearchFilters from './OrderSearchFilters';
import OrdersTable from './OrdersTable';
import { ShoppingBag, TrendingUp, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({ searchParams }: { searchParams: Promise<any> }) {
    const products = await getProducts();
    const sParams = await searchParams;

    // Parse filters from searchParams
    const filters = {
        status: sParams.status ? (Array.isArray(sParams.status) ? sParams.status : [sParams.status]) : undefined,
        excludeStatus: sParams.excludeStatus ? (Array.isArray(sParams.excludeStatus) ? sParams.excludeStatus : [sParams.excludeStatus]) : undefined,
        startDate: sParams.startDate,
        endDate: sParams.endDate,
        product: sParams.product ? (Array.isArray(sParams.product) ? sParams.product : [sParams.product]) : undefined,
        excludeProduct: sParams.excludeProduct ? (Array.isArray(sParams.excludeProduct) ? sParams.excludeProduct : [sParams.excludeProduct]) : undefined,
        search: sParams.search,
    };

    const orders = await getOrders(filters);

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-br from-gray-900 to-blue-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />

                <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                        <ShoppingBag size={16} className="text-blue-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">Sipariş Yönetimi</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Tüm Siparişler</h1>
                        <p className="text-blue-200/60 font-medium mt-1">Sistemdeki tüm siparişleri filtreleyin, düzenleyin ve yönetin.</p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center space-x-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[32px] min-w-[160px]">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={18} className="text-green-400" />
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Toplam</span>
                        </div>
                        <p className="text-3xl font-black">{orders?.length || 0}</p>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Sipariş Bulundu</p>
                    </div>
                </div>
            </div>

            <OrderSearchFilters products={products} initialFilters={sParams} />

            <OrdersTable initialOrders={orders || []} />
        </div>
    );
}
