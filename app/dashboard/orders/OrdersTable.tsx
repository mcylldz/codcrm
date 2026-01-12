'use client';

import { useState } from 'react';
import { getStatusLabel } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import OrderDetailModal from './OrderDetailModal';
import { Eye, Phone, MapPin, Package, CreditCard, ChevronRight } from 'lucide-react';

export default function OrdersTable({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const router = useRouter();

    const handleUpdate = () => {
        router.refresh();
        // Since it's a server component parent, refresh will re-fetch initialOrders
        // But for better UX, we could also update local state if we had the new data
        // For now, refreshing is safer to stay in sync with DB
    };

    // Update local state when initialOrders changes (e.g. after router.refresh())
    useState(() => {
        setOrders(initialOrders);
    });

    return (
        <div className="bg-white rounded-[32px] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Müşteri</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">İletişim & Adres</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Sipariş Detayı</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Ödeme</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Durum</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 text-center">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {initialOrders.map((order) => (
                            <tr
                                key={order.id}
                                className="group hover:bg-blue-50/30 transition-all cursor-pointer"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <td className="p-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-600 font-black text-xs group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-all">
                                            {order.name?.[0]}{order.surname?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 leading-tight group-hover:text-blue-700 transition-colors uppercase">{order.name} {order.surname}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center text-gray-600 text-xs font-bold">
                                            <Phone size={12} className="mr-2 text-gray-400" />
                                            {order.phone}
                                        </div>
                                        <div className="flex items-center text-gray-500 text-[10px] font-bold uppercase tracking-tight">
                                            <MapPin size={12} className="mr-2 text-gray-400" />
                                            {order.city} / {order.district}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                            <Package size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-800 uppercase">{order.product}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">{order.package_id} Paket</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600 font-bold text-xs italic">
                                            ₺
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 tracking-tight">{order.total_price} TL</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">{order.payment_method}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.status === 'teyit_alindi' ? 'bg-green-100 text-green-700' :
                                            order.status === 'kabul_etmedi' ? 'bg-red-100 text-red-700' :
                                                order.status === 'iade_donduruldu' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-orange-100 text-orange-700'
                                        }`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </td>
                                <td className="p-6 text-center">
                                    <button className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {initialOrders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-20 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-300">
                                            <Eye size={40} />
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-black uppercase tracking-tight text-lg">Sipariş Bulunamadı</p>
                                            <p className="text-gray-400 font-bold text-sm">Filtrelerinizi değiştirerek tekrar deneyebilirsiniz.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
}
