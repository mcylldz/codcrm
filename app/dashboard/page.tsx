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

    const filters = {
        startDate: sParams.startDate,
        endDate: sParams.endDate,
        products: sParams.product ? (Array.isArray(sParams.product) ? sParams.product : [sParams.product]) : undefined,
    };

    const stats = await getAnalytics(filters);

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Finansal Analiz & Reklam Performansı</h2>
                <p className="text-gray-500 font-bold mt-1 tracking-tight">Ürün maliyetleri, kargo masrafları ve reklam harcamaları dahil net kar tablosu.</p>
            </div>

            <DashboardFilters products={products || []} />

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<DollarSign className="text-blue-600" />}
                    label="Net Ciro"
                    value={`${stats.netTurnover.toLocaleString('tr-TR')} ₺`}
                    description="Teyitli sipariş toplamı"
                    color="blue"
                />
                <StatCard
                    icon={<Truck className="text-orange-600" />}
                    label="T. Kargo Maliyeti"
                    value={`${stats.totalShipping.toLocaleString('tr-TR')} ₺`}
                    description="Teyitli siparişlerin kargosu"
                    color="orange"
                />
                <StatCard
                    icon={<TrendingUp className="text-green-600" />}
                    label="Net Kar"
                    value={`${stats.netProfit.toLocaleString('tr-TR')} ₺`}
                    description="Ciro - (Ürün + Kargo + Reklam)"
                    color="green"
                />
                <StatCard
                    icon={<Percent className="text-purple-600" />}
                    label="Net Kar Marjı"
                    value={`%${stats.grossMargin.toFixed(1)}`}
                    description="Toplam net karlılık oranı"
                    color="purple"
                />
            </div>

            {/* Reklam İstatistikleri Placeholder */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Facebook size={24} />
                        <h3 className="text-xl font-black uppercase tracking-tight">Reklam Operasyon Analizi</h3>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest bg-blue-700 px-3 py-1 rounded-full">Meta Ads API Bağlantısı Aktif</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Toplam Harcama</p>
                        <p className="text-3xl font-black text-gray-900">{stats.adSpend.toLocaleString('tr-TR')} ₺</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 flex items-center">
                            <ArrowDownRight size={12} className="text-red-500 mr-1" /> Geçen döneme göre %4 azaldı
                        </p>
                    </div>
                    <div className="p-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">
                            <Users size={12} className="mr-1" /> Müşteri Başı Maliyet (CAC)
                        </p>
                        <p className="text-3xl font-black text-gray-900">{(stats.statusCounts.teyit_alindi > 0 ? (stats.adSpend / stats.statusCounts.teyit_alindi) : 0).toFixed(2)} ₺</p>
                        <p className="text-[10px] font-bold text-green-500 mt-2">Hedef: 45.00 ₺</p>
                    </div>
                    <div className="p-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">
                            <MousePointer2 size={12} className="mr-1" /> Tık Başı Maliyet (CPC)
                        </p>
                        <p className="text-3xl font-black text-gray-900">{stats.cpc.toFixed(2)} ₺</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 italic">Meta Ads'ten çekiliyor</p>
                    </div>
                    <div className="p-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">
                            <Eye size={12} className="mr-1" /> Bİn Gösterim (CPM)
                        </p>
                        <p className="text-3xl font-black text-gray-900">{stats.cpm.toFixed(2)} ₺</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-2 italic">Meta Ads'ten çekiliyor</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Status Distribution */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-200 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Operasyonel Kayıplar</h3>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                        <div className="bg-orange-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Kargo Gideri</p>
                            <p className="text-xl font-black text-orange-700">{stats.totalShipping.toLocaleString('tr-TR')} ₺</p>
                            <p className="text-[10px] font-bold text-orange-500 mt-1">Sadece teyitli siparişler</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Bekleyen Potansiyel</p>
                            <p className="text-xl font-black text-blue-700">{stats.potentialTurnover.toLocaleString('tr-TR')} ₺</p>
                            <p className="text-[10px] font-bold text-blue-500 mt-1">Onay bekleyen ciro</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Analysis Summary */}
                <div className="bg-gray-900 p-8 rounded-3xl shadow-xl text-white space-y-8">
                    <div className="flex items-center space-x-2">
                        <BarChart3 size={24} className="text-blue-400" />
                        <h3 className="text-xl font-black uppercase tracking-tight">Kümülatif Maliyet</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Ürün Maliyeti (Teyitli)</span>
                            <span className="text-white">-{stats.netCost.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Kargo Gideri</span>
                            <span className="text-white">-{stats.totalShipping.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Reklam Gideri</span>
                            <span className="text-white">-{stats.adSpend.toLocaleString('tr-TR')} ₺</span>
                        </div>

                        <div className="h-px bg-gray-800 my-4"></div>

                        <div className="pt-2">
                            <div className="bg-blue-600/20 p-6 rounded-3xl border border-blue-500/30">
                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Net Kar</p>
                                <div className="flex justify-between items-baseline">
                                    <p className="text-4xl font-black text-white">{stats.netProfit.toLocaleString('tr-TR')} ₺</p>
                                    <p className="text-xl font-black text-green-400">%{stats.grossMargin.toFixed(1)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Performance Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Ürün ve Kampanya Performansı</h3>
                    <ShoppingBag className="text-gray-300" />
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5 text-left">Ürün</th>
                                <th className="px-8 py-5 text-center">Reklam</th>
                                <th className="px-8 py-5 text-center">Kargo</th>
                                <th className="px-8 py-5 text-center">Net Kar</th>
                                <th className="px-8 py-5 text-center">M. Başı Reklam</th>
                                <th className="px-8 py-5 text-right">Marj</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {stats.productStats.map((ps: any) => {
                                const prodProfit = ps.turnover - ps.cost - ps.shipping;
                                const prodMargin = ps.turnover > 0 ? (prodProfit / ps.turnover) * 100 : 0;
                                return (
                                    <tr key={ps.name} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="font-black text-gray-900">{ps.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase">{ps.confirmed}/{ps.orders} Teyit</div>
                                        </td>
                                        <td className="px-8 py-5 text-center whitespace-nowrap font-bold text-gray-700">0 ₺</td>
                                        <td className="px-8 py-5 text-center whitespace-nowrap font-bold text-orange-600">-{ps.shipping.toLocaleString('tr-TR')} ₺</td>
                                        <td className="px-8 py-5 text-center whitespace-nowrap font-black text-blue-600">{prodProfit.toLocaleString('tr-TR')} ₺</td>
                                        <td className="px-8 py-5 text-center whitespace-nowrap font-bold text-gray-400">-%0</td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right font-black text-green-600">%{prodMargin.toFixed(1)}</td>
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
