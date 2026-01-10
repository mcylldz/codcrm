import { getAnalytics, getProducts } from '@/app/actions';
import DashboardFilters from './DashboardFilters';
import {
    TrendingUp,
    CheckCircle2,
    Clock,
    XSquare,
    AlertCircle,
    DollarSign,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingBag,
    Percent
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<any> }) {
    const sParams = await searchParams;
    const products = await getProducts();

    const filters = {
        startDate: sParams.startDate,
        endDate: sParams.endDate,
        products: sParams.product ? (Array.isArray(sParams.product) ? sParams.product : [sParams.product]) : undefined,
    };

    const stats = await getAnalytics(filters);

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Genel Bakış</h2>
                <p className="text-gray-500 font-bold mt-1">İşletmenizin tüm performans verileri tek bir ekranda.</p>
            </div>

            <DashboardFilters products={products || []} />

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<DollarSign className="text-blue-600" />}
                    label="Brüt Ciro"
                    value={`${stats.grossTurnover.toLocaleString('tr-TR')} ₺`}
                    description="Toplam sipariş tutarı"
                    color="blue"
                />
                <StatCard
                    icon={<CheckCircle2 className="text-green-600" />}
                    label="Net Ciro"
                    value={`${stats.netTurnover.toLocaleString('tr-TR')} ₺`}
                    description="Teyit alınan siparişler"
                    color="green"
                />
                <StatCard
                    icon={<TrendingUp className="text-purple-600" />}
                    label="Brüt Kar"
                    value={`${stats.netProfit.toLocaleString('tr-TR')} ₺`}
                    description="Net ciro - Ürün maliyeti"
                    color="purple"
                />
                <StatCard
                    icon={<Percent className="text-orange-600" />}
                    label="Brüt Marj"
                    value={`%${stats.grossMargin.toFixed(1)}`}
                    description="Karlılık oranı"
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Distribution */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Sipariş Operasyon Analizi</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1.5">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-bold text-gray-500">Teyitli</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-xs font-bold text-gray-500">Kayıp</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <ProgressBar
                            label="Teyit Alma Oranı"
                            value={stats.confirmedRate}
                            count={stats.statusCounts.teyit_alindi}
                            color="bg-green-500"
                            icon={<CheckCircle2 size={16} />}
                        />
                        <ProgressBar
                            label="Kayıp/Red Oranı"
                            value={stats.rejectedRate}
                            count={stats.statusCounts.ulasilamadi + stats.statusCounts.kabul_etmedi}
                            color="bg-red-500"
                            icon={<XSquare size={16} />}
                        />
                        <ProgressBar
                            label="Bekleyen Sipariş Oranı"
                            value={stats.totalOrders > 0 ? (stats.statusCounts.teyit_bekleniyor / stats.totalOrders) * 100 : 0}
                            count={stats.statusCounts.teyit_bekleniyor}
                            color="bg-blue-400"
                            icon={<Clock size={16} />}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                        <div className="bg-orange-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Kayıp Potansiyel Ciro</p>
                            <p className="text-xl font-black text-orange-700">{stats.lostTurnover.toLocaleString('tr-TR')} ₺</p>
                            <p className="text-[10px] font-bold text-orange-500 mt-1">Ulaşılamadı & Kabul Etmedi</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Beklenen Ciro</p>
                            <p className="text-xl font-black text-blue-700">{stats.potentialTurnover.toLocaleString('tr-TR')} ₺</p>
                            <p className="text-[10px] font-bold text-blue-500 mt-1">Teyit Bekleyenler</p>
                        </div>
                    </div>
                </div>

                {/* Product Cost Summary */}
                <div className="bg-gray-900 p-8 rounded-3xl shadow-xl text-white space-y-8">
                    <div className="flex items-center space-x-2">
                        <BarChart3 size={24} className="text-blue-400" />
                        <h3 className="text-xl font-black uppercase tracking-tight">Maliyet Analizi</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Toplam Ürün Maliyeti</p>
                            <p className="text-3xl font-black">{stats.totalCost.toLocaleString('tr-TR')} ₺</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Gelen tüm siparişlerin maliyeti</p>
                        </div>

                        <div className="h-px bg-gray-800"></div>

                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Teyitli Ürün Maliyeti</p>
                            <p className="text-3xl font-black text-green-400">{stats.netCost.toLocaleString('tr-TR')} ₺</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Sadece onaylananların maliyeti</p>
                        </div>

                        <div className="pt-6">
                            <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Kar Analizi</p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-black text-blue-400">{stats.netProfit.toLocaleString('tr-TR')} ₺</p>
                                        <p className="text-[10px] text-gray-500 font-bold">NET KAZANÇ</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-green-400">%{stats.grossMargin.toFixed(1)}</p>
                                        <p className="text-[10px] text-gray-500 font-bold">MARJ</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Performance Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Ürün Bazlı Performans</h3>
                    <ShoppingBag className="text-gray-300" />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5 text-left">Ürün</th>
                                <th className="px-8 py-5 text-left">Toplam Sipariş</th>
                                <th className="px-8 py-5 text-left">Teyitli</th>
                                <th className="px-8 py-5 text-left">Teyit Oranı</th>
                                <th className="px-8 py-5 text-left">Net Ciro</th>
                                <th className="px-8 py-5 text-left">Net Kar</th>
                                <th className="px-8 py-5 text-right">Marj</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {stats.productStats.map((ps: any) => {
                                const profit = ps.turnover - ps.cost;
                                const margin = ps.turnover > 0 ? (profit / ps.turnover) * 100 : 0;
                                const rate = ps.orders > 0 ? (ps.confirmed / ps.orders) * 100 : 0;
                                return (
                                    <tr key={ps.name} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap font-black text-gray-900">{ps.name}</td>
                                        <td className="px-8 py-5 whitespace-nowrap font-bold text-gray-700">{ps.orders}</td>
                                        <td className="px-8 py-5 whitespace-nowrap font-bold text-green-600">{ps.confirmed}</td>
                                        <td className="px-8 py-5 whitespace-nowrap font-bold text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${rate}%` }}></div>
                                                </div>
                                                <span>%{rate.toFixed(0)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap font-black text-gray-900">{ps.turnover.toLocaleString('tr-TR')} ₺</td>
                                        <td className="px-8 py-5 whitespace-nowrap font-black text-blue-600">{profit.toLocaleString('tr-TR')} ₺</td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right font-black text-green-600">%{margin.toFixed(1)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, description, color }: any) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        purple: 'bg-purple-50',
        orange: 'bg-orange-50',
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colorMap[color] || 'bg-gray-50'} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <ArrowUpRight size={16} className="text-gray-300" />
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase">{description}</p>
            </div>
        </div>
    );
}

function ProgressBar({ label, value, count, color, icon }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400">{icon}</span>
                    <span className="text-sm font-black text-gray-700 uppercase tracking-tight">{label}</span>
                </div>
                <div className="text-right">
                    <span className="text-sm font-black text-gray-900">{count} Sipariş</span>
                    <span className="text-xs font-bold text-gray-400 ml-2">%{value.toFixed(1)}</span>
                </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out rounded-full`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
}
