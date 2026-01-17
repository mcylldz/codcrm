import { getOrders, getProducts } from '@/app/actions';
import UnifiedOrdersTable from './UnifiedOrdersTable';
import ReturnUpload from './ReturnUpload';
import { ShoppingBag, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OrdersPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;

    // Parse filters from URL
    const status = typeof searchParams.status === 'string' ? searchParams.status.split(',') : Array.isArray(searchParams.status) ? searchParams.status : undefined;
    const product = typeof searchParams.product === 'string' ? searchParams.product.split(',') : Array.isArray(searchParams.product) ? searchParams.product : undefined;
    const tags = typeof searchParams.tags === 'string' ? searchParams.tags.split(',') : Array.isArray(searchParams.tags) ? searchParams.tags : undefined;
    const startDate = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined;
    const endDate = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined;
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

    const ordersData = await getOrders({
        status,
        product,
        tags,
        startDate,
        endDate,
        page,
        limit: 50,
        search
    });

    const products = await getProducts();

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
                        <p className="text-blue-200/60 font-medium mt-1">Siparişleri yönetin, teyit arayın ve iadeleri işleyin.</p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center space-x-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[32px] min-w-[160px]">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={18} className="text-green-400" />
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Toplam</span>
                        </div>
                        <p className="text-3xl font-black">{ordersData.count || 0}</p>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-1">Sipariş Bulundu</p>
                    </div>
                </div>
            </div>

            {/* Tools Section (Return Upload) */}
            <ReturnUpload />

            {/* Unified Table */}
            <UnifiedOrdersTable
                initialOrders={ordersData.data || []}
                totalCount={ordersData.count || 0}
                currentPage={ordersData.page}
                totalPages={ordersData.totalPages}
                products={products || []}
            />
        </div>
    );
}
