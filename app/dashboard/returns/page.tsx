import { getProducts, getAnalytics } from '@/app/actions';
import DashboardFilters from '../DashboardFilters';
import ReturnsAnalytics from './ReturnsAnalytics';
import ReturnUpload from '../orders/ReturnUpload';
import { RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReturnsPage({ searchParams }: { searchParams: Promise<any> }) {
    const products = await getProducts();
    const sParams = await searchParams;

    const filters = {
        startDate: sParams.startDate || new Date().toISOString().split('T')[0],
        endDate: sParams.endDate || new Date().toISOString().split('T')[0],
        products: sParams.product ? (Array.isArray(sParams.product) ? sParams.product : [sParams.product]) : undefined,
    };

    const analytics = await getAnalytics(filters);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-white/95 shadow-sm">
                <div className="max-w-[1800px] mx-auto px-6 py-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
                            <RefreshCw className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">İade Yönetimi</h1>
                            <p className="text-sm text-gray-500 font-semibold tracking-wide">Operasyonel iade takibi ve analizleri</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-6 py-8 space-y-8">
                {/* Filters and Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <DashboardFilters products={products || []} basePath="/dashboard/returns" />
                    </div>
                    <div className="lg:col-span-1">
                        <ReturnUpload />
                    </div>
                </div>

                {/* Analytics Section */}
                <ReturnsAnalytics analytics={analytics} />
            </div>
        </div>
    );
}
