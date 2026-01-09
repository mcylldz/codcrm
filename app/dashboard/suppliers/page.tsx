import { supabaseAdmin } from '@/lib/supabaseAdmin';
import SupplierDashboard from './SupplierDashboard';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
    // Fetch Suppliers with mapped products
    const { data: suppliers } = await supabaseAdmin
        .from('suppliers')
        .select('*, supplier_products(products(*))')
        .order('company_name');

    // Fetch Products
    const { data: products } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('name');

    // Fetch Purchases (Trade History)
    const { data: purchases } = await supabaseAdmin
        .from('purchases')
        .select('*, suppliers(company_name), products(name)')
        .order('date', { ascending: false });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900">Tedarikçi ve Stok Giriş Yönetimi</h2>
                <p className="text-gray-500 mt-1 font-medium">Tedarikçilerinizi yönetin ve yeni stok girişlerini takip edin.</p>
            </div>

            <SupplierDashboard
                suppliers={suppliers || []}
                products={products || []}
                purchases={purchases || []}
            />
        </div>
    );
}
