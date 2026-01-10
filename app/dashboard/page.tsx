import { getAnalytics, getProducts } from '@/app/actions';
import DashboardFilters from './DashboardFilters';
import {
    TrendingUp,
    CheckCircle2,
    Clock,
    DollarSign,
    BarChart3,
    ArrowUpRight,
    ShoppingBag,
    Percent,
    Truck,
    Facebook,
    Users,
    MousePointer2,
    Eye,
    Target,
    Zap,
    Award,
    TrendingDown,
    Package
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<any> }) {
    const sParams = await searchParams;
    const products = await getProducts();

    const today = new Date().toISOString().split('T')[0];
    const filters = {
        startDate: sParams.startDate || today,
        endDate: sParams.endDate || today,
        products: sParams.product ? (Array.isArray(sParams.product) ? sParams.product : [sParams.product]) : undefined,
    };

    const stats = await getAnalytics(filters);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-lg bg-white/95 shadow-sm">
                <div className="max-w-[1800px] mx-auto px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <BarChart3 className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
                                <p className="text-sm text-gray-500 font-semibold">Gerçek zamanlı operasyon ve reklam metrikleri</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
                                <Clock size={16} className="text-blue-600" />
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Live</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2.5 rounded-xl border border-green-100">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Meta API Connected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto px-6 py-8 space-y-8">
                <DashboardFilters products={products || []} />

                {/* KPI Overview Grid - 6 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <KPICard
                        icon={<DollarSign size={20} />}
                        label="Brüt Ciro"
                        value={`${stats.grossTurnover.toLocaleString('tr-TR')} ₺`}
                        change={`${stats.totalOrders} Sipariş`}
                        trend="up"
                        color="blue"
                    />
                    <KPICard
                        icon={<CheckCircle2 size={20} />}
                        label="Net Ciro"
                        value={`${stats.netTurnover.toLocaleString('tr-TR')} ₺`}
                        change={`${stats.confirmedOrders} Teyitli`}
                        trend="up"
                        color="green"
                    />
                    <KPICard
                        icon={<TrendingUp size={20} />}
                        label="Net Kar"
                        value={`${stats.netProfit.toLocaleString('tr-TR')} ₺`}
                        change={`%${stats.netMargin.toFixed(1)} Marj`}
                        trend="up"
                        color="purple"
                    />
                    <KPICard
                        icon={<Target size={20} />}
                        label="ROAS"
                        value={`${stats.roas.toFixed(2)}x`}
                        change="Return on Ad Spend"
                        trend={stats.roas >= 3 ? "up" : "down"}
                        color="orange"
                    />
                    <KPICard
                        icon={<Percent size={20} />}
                        label="ROI"
                        value={`%${stats.roi.toFixed(1)}`}
                        change="Return on Investment"
                        trend={stats.roi >= 50 ? "up" : "down"}
                        color="teal"
                    />
                    <KPICard
                        icon={<Users size={20} />}
                        label="Net CAC"
                        value={`${stats.netCac.toFixed(2)} ₺`}
                        change="Müşteri Maliyeti"
                        trend={stats.netCac < 70 ? "up" : "down"}
                        color="pink"
                    />
                </div>

                {/* Main Analytics Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Advertising Performance */}
                    <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Facebook size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">Reklam Performansı</h3>
                                        <p className="text-xs text-blue-100 font-semibold">Meta Ads Analytics</p>
                                    </div>
                                </div>
                                <div className="flex space-x-4 text-center">
                                    <div>
                                        <p className="text-xs opacity-80 font-semibold">CPC</p>
                                        <p className="font-black">{stats.cpc.toFixed(2)} ₺</p>
                                    </div>
                                    <div>
                                        <p className="text-xs opacity-80 font-semibold">CPM</p>
                                        <p className="font-black">{stats.cpm.toFixed(2)} ₺</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-gray-100">
                            <MetricBox label="Ad Spend" value={`${stats.adSpend.toLocaleString('tr-TR')} ₺`} icon={<DollarSign size={16} />} />
                            <MetricBox label="Conversion" value={`%${stats.convRate.toFixed(1)}`} icon={<Target size={16} />} highlight />
                            <MetricBox label="Page Views" value={stats.lpv.toLocaleString('tr-TR')} icon={<Eye size={16} />} />
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
                            <Zap size={16} className="mr-2 text-yellow-500" />
                            Hızlı Metrikler
                        </h3>
                        <div className="space-y-4">
                            <QuickStat label="Onay Oranı" value={`%${((stats.confirmedOrders / stats.totalOrders) * 100 || 0).toFixed(1)}`} max={100} current={(stats.confirmedOrders / stats.totalOrders) * 100 || 0} color="green" />
                            <QuickStat label="Brüt CAC" value={`${stats.grossCac.toFixed(2)} ₺`} subtitle="Sipariş başı" />
                            <QuickStat label="Kargo Maliyeti" value={`${stats.totalShipping.toLocaleString('tr-TR')} ₺`} subtitle="Toplam" />
                            <QuickStat label="Ürün Maliyeti" value={`${stats.netCost.toLocaleString('tr-TR')} ₺`} subtitle="Net" />
                        </div>
                    </div>
                </div>

                {/* Product Performance Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Ürün Performans Analizi</h3>
                                    <p className="text-xs text-gray-300 font-semibold">Detaylı karlılık ve stok takibi</p>
                                </div>
                            </div>
                            <Award size={24} className="text-yellow-400 opacity-50" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Ürün</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Satış</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Ad Spend</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">ROAS</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Net CAC</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Sipariş Başı Kar</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Ürün Başı Kar</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Stok Ömrü</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Net Kar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.productStats.map((ps: any, idx: number) => (
                                    <tr key={ps.name} className="hover:bg-blue-50/30 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{ps.name}</div>
                                                    <div className="text-[10px] text-gray-500 font-semibold">{ps.confirmed}/{ps.orders} Teyit • {ps.totalUnitsSold} Adet</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="font-bold text-gray-900">{ps.netTurnover.toLocaleString('tr-TR')} ₺</div>
                                            <div className="text-[10px] text-green-600 font-semibold">%{ps.margin.toFixed(1)} Marj</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="font-bold text-gray-700">{ps.adSpend.toLocaleString('tr-TR')} ₺</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${ps.roas >= 3 ? 'bg-green-100 text-green-700' : ps.roas >= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {ps.roas.toFixed(2)}x
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`font-bold ${ps.netCac > 70 ? 'text-red-600' : 'text-blue-600'}`}>{ps.netCac.toFixed(2)} ₺</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="font-bold text-gray-900">{ps.netProfitPerOrder.toFixed(2)} ₺</div>
                                            <div className="text-[10px] text-gray-500 font-semibold">Sipariş Bazlı</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="font-bold text-purple-600">{ps.netProfitPerUnit.toFixed(2)} ₺</div>
                                            <div className="text-[10px] text-purple-500 font-semibold">Adet Bazlı</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {ps.stockDays === Infinity ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-400">
                                                    <Package size={12} className="mr-1" /> Veri Yok
                                                </span>
                                            ) : ps.stockDays < 5 ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-600 animate-pulse">
                                                    <TrendingDown size={12} className="mr-1" /> {ps.stockDays} Gün!
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-700">
                                                    <TrendingUp size={12} className="mr-1" /> {ps.stockDays} Gün
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-black text-gray-900 text-lg">{ps.netProfit.toLocaleString('tr-TR')} ₺</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Profit Funnel - Keep as requested */}
                <div className="bg-gray-900 rounded-[40px] p-10 md:p-16 shadow-2xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-12 text-center">Operasyonel Karlılık Hunisi</h3>
                        <div className="max-w-4xl mx-auto space-y-4">
                            <FunnelStep label="Brüt Ciro" value={`${stats.grossTurnover.toLocaleString('tr-TR')} ₺`} sub={`${stats.totalOrders} Sipariş`} width="w-full" opacity="bg-blue-600/100" />
                            <FunnelStep label="Net Ciro (Teyitli)" value={`${stats.netTurnover.toLocaleString('tr-TR')} ₺`} sub={`${stats.confirmedOrders} Onaylı`} width="w-[90%]" opacity="bg-blue-600/80" percent={((stats.netTurnover / stats.grossTurnover) * 100 || 0).toFixed(1)} />
                            <FunnelStep label="Ürün Maliyeti Sonrası" value={`${(stats.netTurnover - stats.netCost).toLocaleString('tr-TR')} ₺`} sub={`${stats.netCost.toLocaleString('tr-TR')} ₺ Maliyet`} width="w-[80%]" opacity="bg-blue-600/60" percent={(((stats.netTurnover - stats.netCost) / stats.netTurnover) * 100 || 0).toFixed(1)} />
                            <FunnelStep label="Kargo Maliyeti Sonrası" value={`${(stats.netTurnover - stats.netCost - stats.totalShipping).toLocaleString('tr-TR')} ₺`} sub={`${stats.totalShipping.toLocaleString('tr-TR')} ₺ Kargo`} width="w-[70%]" opacity="bg-blue-600/40" percent={(((stats.netTurnover - stats.netCost - stats.totalShipping) / (stats.netTurnover - stats.netCost)) * 100 || 0).toFixed(1)} />
                            <FunnelStep label="NET KAR (Reklam Sonrası)" value={`${stats.netProfit.toLocaleString('tr-TR')} ₺`} sub={`${stats.adSpend.toLocaleString('tr-TR')} ₺ Reklam`} width="w-[60%]" opacity="bg-green-500" percent={((stats.netProfit / stats.netTurnover) * 100 || 0).toFixed(1)} isFinal />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ icon, label, value, change, trend, color }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    color: 'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'pink';
}) {
    const colors: Record<'blue' | 'green' | 'purple' | 'orange' | 'teal' | 'pink', string> = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        teal: 'from-teal-500 to-teal-600',
        pink: 'from-pink-500 to-pink-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`}></div>
            <div className="relative z-10">
                <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${colors[color]} mb-3`}>
                    <div className="text-white">{icon}</div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
                    <div className="flex items-center space-x-1">
                        {trend === "up" ? <ArrowUpRight size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-red-500" />}
                        <p className="text-[10px] font-semibold text-gray-500">{change}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricBox({ label, value, icon, highlight }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    highlight?: boolean;
}) {
    return (
        <div className={`p-6 ${highlight ? 'bg-blue-50' : ''}`}>
            <div className="flex items-center justify-center space-x-2 mb-2 text-gray-400">
                {icon}
                <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
            </div>
            <p className={`text-2xl font-black text-center ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</p>
        </div>
    );
}

function QuickStat({ label, value, subtitle, max, current, color }: {
    label: string;
    value: string;
    subtitle?: string;
    max?: number;
    current?: number;
    color?: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-600">{label}</p>
                <p className="text-sm font-black text-gray-900">{value}</p>
            </div>
            {subtitle && <p className="text-[10px] text-gray-400 font-semibold">{subtitle}</p>}
            {max !== undefined && current !== undefined && (
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-${color}-500 transition-all rounded-full`} style={{ width: `${Math.min((current / max) * 100, 100)}%` }}></div>
                </div>
            )}
        </div>
    );
}

function FunnelStep({ label, value, sub, width, opacity, percent, isFinal }: {
    label: string;
    value: string;
    sub: string;
    width: string;
    opacity: string;
    percent?: string;
    isFinal?: boolean;
}) {
    return (
        <div className="flex flex-col items-center group">
            <div className={`flex items-center justify-between px-8 py-6 rounded-2xl ${opacity} ${width} transition-all duration-500 hover:scale-[1.02] cursor-default border border-white/10`}>
                <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isFinal ? 'text-black' : 'text-blue-100'}`}>{label}</span>
                    <span className={`text-xl font-black ${isFinal ? 'text-black' : 'text-white'}`}>{value}</span>
                </div>
                <div className="text-right">
                    {percent && <span className={`text-lg font-black block ${isFinal ? 'text-black' : 'text-blue-200'}`}>%{percent}</span>}
                    <span className={`text-[10px] font-bold uppercase ${isFinal ? 'text-black/60' : 'text-white/40'}`}>{sub}</span>
                </div>
            </div>
            {!isFinal && <div className="h-4 w-px bg-gray-700"></div>}
        </div>
    );
}
