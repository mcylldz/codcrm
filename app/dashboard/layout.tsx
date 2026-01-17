import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, ListChecks, Calendar, Package, Truck, LogOut, Link2, RefreshCw } from 'lucide-react';
import { cookies } from 'next/headers';
import ClientLogout from './LogoutButton';

export const metadata: Metadata = {
    title: 'EPADEM Dashboard',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">EPADEM</h1>
                    <p className="text-xs text-gray-500">CRM & Sipariş Takip</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink href="/dashboard" icon={<Home size={20} />} label="Genel Bakış" />
                    <NavLink href="/dashboard/orders" icon={<ListChecks size={20} />} label="Siparişler" />

                    <NavLink href="/dashboard/returns" icon={<RefreshCw size={20} />} label="İadeler" />
                    <NavLink href="/dashboard/inventory" icon={<Package size={20} />} label="Stok / Ürünler" />
                    <NavLink href="/dashboard/suppliers" icon={<Truck size={20} />} label="Tedarikçiler" />
                    <NavLink href="/dashboard/webhooks" icon={<Link2 size={20} />} label="Entegrasyonlar" />
                </nav>

                <div className="p-4 border-t">
                    <ClientLogout />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link href={href} className="flex items-center space-x-3 text-gray-700 p-2 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors">
            {icon}
            <span>{label}</span>
        </Link>
    );
}
