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
    Percent,
    Truck,
    Facebook,
    Users,
    MousePointer2,
    Eye
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
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight leading-none">Analitik Dashboard</h2>
                    <p className="text-gray-500 font-bold mt-2 tracking-tight">Gerçek zamanlı karlılık, reklam verimi ve stok tahminleri.</p>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                    <Clock size={16} className="text-blue-600" />
                    <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Son Güncelleme: Az Önce</span>
                </div>
            </div>

            <DashboardFilters products={products || []} />

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<DollarSign className="text-blue-600" />}
                    label="Brüt Ciro"
                    value={`${stats.grossTurnover.toLocaleString('tr-TR')} ₺`}
                    description="Tüm siparişlerin toplamı"
                    trend={`${stats.totalOrders} Sipariş`}
                    color="blue"
                />
                <StatCard
                    icon={<CheckCircle2 className="text-green-600" />}
                    label="Net Ciro"
                    value={`${stats.netTurnover.toLocaleString('tr-TR')} ₺`}
                    description="Sadece teyitli siparişler"
                    trend={`${stats.confirmedOrders} Onaylı`}
                    color="green"
                />
                <StatCard
                    icon={<TrendingUp className="text-purple-600" />}
                    label="Net Kar"
                    value={`${stats.netProfit.toLocaleString('tr-TR')} ₺`}
                    description="Tüm masraflar sonrası"
                    trend={`%${stats.netMargin.toFixed(1)} Marj`}
                    color="purple"
                />
                <StatCard
                    icon={<Users className="text-orange-600" />}
                    label="Net CAC"
                    value={`${stats.netCac.toFixed(2)} ₺`}
                    description="Müşteri edinme maliyeti"
                    trend="Teyitli başı"
                    color="orange"
                />
            </div>

            {/* Reklam ve Dönüşüm Analizi */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-gray-900 p-6 text-white flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Facebook size={20} className="text-blue-400" />
                            <h3 className="text-lg font-black uppercase tracking-tight">Reklam Operasyonu</h3>
                        </div>
                        <div className="flex space-x-4">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">CPC</p>
                                <p className="text-sm font-black">{stats.cpc.toFixed(2)} ₺</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">CPM</p>
                                <p className="text-sm font-black">{stats.cpm.toFixed(2)} ₺</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        <div className="p-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Toplam Harcama</p>
                            <p className="text-3xl font-black text-gray-900">{stats.adSpend.toLocaleString('tr-TR')} ₺</p>
                        </div>
                        <div className="p-8 bg-blue-50/30">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center">
                                <MousePointer2 size={12} className="mr-1" /> Dönüşüm Oranı
                            </p>
                            <p className="text-3xl font-black text-blue-700">%{stats.convRate.toFixed(1)}</p>
                        </div>
                        <div className="p-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">
                                <Eye size={12} className="mr-1" /> Sayfa Görüntüleme
                            </p>
                            <p className="text-3xl font-black text-gray-900">{stats.lpv.toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col justify-center">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Operasyonel Performans</h3>
                    <div className="space-y-6">
                        <ProgressBar
                            label="Teyit Oranı"
                            value={(stats.confirmedOrders / stats.totalOrders) * 100 || 0}
                            count={stats.confirmedOrders}
                            color="bg-green-500"
                            icon={<CheckCircle2 size={16} />}
                        />
                        <ProgressBar
                            label="Brüt CAC"
                            value={((stats.adSpend / stats.totalOrders) / 100) * 100 || 0} // visual purpose
                            count={`${(stats.adSpend / stats.totalOrders || 0).toFixed(2)} ₺`}
                            color="bg-blue-400"
                            labelOverride="Brüt CAC"
                            icon={<Users size={16} />}
                        />
                    </div>
                </div>
            </div>

            {/* Product Performance Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Ürün ve Kampanya Performansı</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Reklam harcaması dahil ürün bazlı karlılık</p>
                    </div>
                    <ShoppingBag size={24} className="text-gray-200" />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5 text-left">Ürün Bilgisi</th>
                                <th className="px-8 py-5 text-center">Reklam (Spend)</th>
                                <th className="px-8 py-5 text-center">Net CAC</th>
                                <th className="px-8 py-5 text-center">Ürün Başı Kar</th>
                                <th className="px-8 py-5 text-center">Stok Ömrü</th>
                                <th className="px-8 py-5 text-right">Net Kar / Marj</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {stats.productStats.map((ps: any) => (
                                <tr key={ps.name} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-8 py-5 whitespace-nowrap">
                                        <div className="font-black text-gray-900">{ps.name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{ps.confirmed}/{ps.orders} Teyitli Satış</div>
                                    </td>
                                    <td className="px-8 py-5 text-center whitespace-nowrap">
                                        <div className="font-bold text-gray-700">{ps.adSpend.toLocaleString('tr-TR')} ₺</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Meta Verisi</div>
                                    </td>
                                    <td className="px-8 py-5 text-center whitespace-nowrap">
                                        <div className={`font-black ${ps.netCac > 70 ? 'text-red-500' : 'text-blue-600'}`}>
                                            {ps.netCac.toFixed(2)} ₺
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center whitespace-nowrap">
                                        <div className="font-black text-gray-900">{ps.netProfitPerUnit.toFixed(2)} ₺</div>
                                        <div className="text-[10px] text-green-500 font-bold uppercase">Adet Başı Net</div>
                                    </td>
                                    <td className="px-8 py-5 text-center whitespace-nowrap">
                                        {ps.stockDays === Infinity ? (
                                            <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Veri Yok</span>
                                        ) : ps.stockDays < 5 ? (
                                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">{ps.stockDays} Gün Kaldı!</span>
                                        ) : (
                                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{ps.stockDays} Günlük Stok</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-right">
                                        <div className="font-black text-gray-900">{ps.netProfit.toLocaleString('tr-TR')} ₺</div>
                                        <div className="text-[10px] text-green-600 font-bold uppercase">%{ps.margin.toFixed(1)} Marj</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Huni Şeklinde Kar Dağılımı */}
            <div className="bg-gray-900 rounded-[40px] p-10 md:p-16 shadow-2xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-12 text-center">Operasyonel Karlılık Hunisi</h3>

                    <div className="max-w-4xl mx-auto space-y-4">
                        <FunnelStep
                            label="Brüt Ciro"
                            value={`${stats.grossTurnover.toLocaleString('tr-TR')} ₺`}
                            sub={`${stats.totalOrders} Sipariş`}
                            width="w-full"
                            opacity="bg-blue-600/100"
                        />
                        <FunnelStep
                            label="Net Ciro (Teyitli)"
                            value={`${stats.netTurnover.toLocaleString('tr-TR')} ₺`}
                            sub={`${stats.confirmedOrders} Onaylı`}
                            width="w-[90%]"
                            opacity="bg-blue-600/80"
                            percent={((stats.netTurnover / stats.grossTurnover) * 100 || 0).toFixed(1)}
                        />
                        <FunnelStep
                            label="Ürün Maliyeti Sonrası"
                            value={`${(stats.netTurnover - stats.netCost).toLocaleString('tr-TR')} ₺`}
                            sub={`${stats.netCost.toLocaleString('tr-TR')} ₺ Maliyet`}
                            width="w-[80%]"
                            opacity="bg-blue-600/60"
                            percent={(((stats.netTurnover - stats.netCost) / stats.netTurnover) * 100 || 0).toFixed(1)}
                        />
                        <FunnelStep
                            label="Kargo Maliyeti Sonrası"
                            value={`${(stats.netTurnover - stats.netCost - stats.totalShipping).toLocaleString('tr-TR')} ₺`}
                            sub={`${stats.totalShipping.toLocaleString('tr-TR')} ₺ Kargo`}
                            width="w-[70%]"
                            opacity="bg-blue-600/40"
                            percent={(((stats.netTurnover - stats.netCost - stats.totalShipping) / (stats.netTurnover - stats.netCost)) * 100 || 0).toFixed(1)}
                        />
                        <FunnelStep
                            label="NET KAR (Reklam Sonrası)"
                            value={`${stats.netProfit.toLocaleString('tr-TR')} ₺`}
                            sub={`${stats.adSpend.toLocaleString('tr-TR')} ₺ Reklam`}
                            width="w-[60%]"
                            opacity="bg-green-500"
                            percent={((stats.netProfit / stats.netTurnover) * 100 || 0).toFixed(1)}
                            isFinal
                        />
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}

function FunnelStep({ label, value, sub, width, opacity, percent, isFinal }: any) {
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

function StatCard({ icon, label, value, description, trend, color }: any) {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        purple: 'bg-purple-50',
        orange: 'bg-orange-50',
    };

    return (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 ${colorMap[color]} rounded-full opacity-50 transition-transform group-hover:scale-110`}></div>
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${colorMap[color] || 'bg-gray-50'}`}>
                        {icon}
                    </div>
                    {trend && (
                        <span className="text-[10px] font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{trend}</span>
                    )}
                </div>
                <div className="mt-auto">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tight mb-2">{value}</p>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{description}</p>
                </div>
            </div>
        </div>
    );
}

function ProgressBar({ label, value, count, color, icon, labelOverride }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400">{icon}</span>
                    <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{label}</span>
                </div>
                <div className="text-right flex flex-col">
                    <span className="text-sm font-black text-gray-900">{count}</span>
                    {!labelOverride && <span className="text-[10px] font-bold text-gray-400">%{value.toFixed(1)}</span>}
                </div>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-1 border border-gray-50 shadow-inner">
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out rounded-full shadow-sm`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                ></div>
            </div>
        </div>
    );
}
