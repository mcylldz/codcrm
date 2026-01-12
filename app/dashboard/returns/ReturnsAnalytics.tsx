'use client';

import { RefreshCw, TrendingDown, Percent, DollarSign, Package, AlertCircle } from 'lucide-react';

export default function ReturnsAnalytics({ analytics }: { analytics: any }) {
    if (!analytics) return null;

    return (
        <div className="space-y-8">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Toplam İade"
                    value={analytics.returnedOrders}
                    icon={<RefreshCw className="text-purple-600" />}
                    subValue="Toplam Sipariş Sayısı"
                    color="purple"
                />
                <StatCard
                    label="İade Edilen Ürün"
                    value={analytics.returnedUnits}
                    icon={<Package className="text-blue-600" />}
                    subValue="Toplam Paket Sayısı"
                    color="blue"
                />
                <StatCard
                    label="İade Oranı"
                    value={`${analytics.returnRate.toFixed(1)}%`}
                    icon={<Percent className="text-orange-600" />}
                    subValue="Onaylı Siparişlere Oranı"
                    color="orange"
                />
                <StatCard
                    label="İade Maliyeti"
                    value={`${analytics.totalReturnCost.toLocaleString('tr-TR')} ₺`}
                    icon={<TrendingDown className="text-red-600" />}
                    subValue="Ekstra Kargo & Zarar"
                    color="red"
                />
            </div>

            {/* Product Performance Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Ürün Bazlı İade Performansı</h3>
                        <p className="text-sm text-gray-500 font-bold mt-1">Hangi ürün daha fazla iade alıyor?</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Ürün</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Onaylanan</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">İade Olan</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">İade Oranı</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">İade Maliyeti</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {analytics.productStats.map((p: any) => (
                                <tr key={p.name} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                                                <Package className="text-gray-400" size={20} />
                                            </div>
                                            <span className="font-bold text-gray-900">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg text-sm">{p.confirmed}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg text-sm">{p.returned} Sipariş</span>
                                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mt-1">{p.returnedUnits} Ürün</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="flex-1 max-w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${p.returnRate > 30 ? 'bg-red-500' : p.returnRate > 15 ? 'bg-orange-500' : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min(100, p.returnRate)}%` }}
                                                />
                                            </div>
                                            <span className={`font-black text-sm ${p.returnRate > 30 ? 'text-red-600' : p.returnRate > 15 ? 'text-orange-600' : 'text-green-600'
                                                }`}>
                                                %{p.returnRate.toFixed(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className="font-black text-gray-900">{p.returnCost.toLocaleString('tr-TR')} ₺</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Warning Section */}
            {analytics.returnRate > 20 && (
                <div className="bg-orange-50 border-2 border-orange-100 rounded-[32px] p-8 flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 flex-shrink-0">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-orange-900 uppercase tracking-tight">Dikkat: Yüksek İade Oranı!</h4>
                        <p className="text-orange-700 font-bold mt-1">İade oranınız %20'nin üzerinde. Ürün kalitesini veya kargo süreçlerini kontrol etmenizi öneririz.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, icon, subValue, color }: { label: string, value: any, icon: any, subValue: string, color: string }) {
    const colorClasses: any = {
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        red: "bg-red-50 text-red-600 border-red-100",
        gray: "bg-gray-50 text-gray-600 border-gray-100"
    };

    return (
        <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform ${colorClasses[color].split(' ')[0]}`}></div>
            <div className="flex flex-col space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</h4>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-black text-gray-900 tracking-tight">{value}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-bold mt-1 tracking-tight">{subValue}</p>
                </div>
            </div>
        </div>
    );
}
