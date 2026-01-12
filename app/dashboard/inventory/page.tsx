import { supabaseAdmin } from '@/lib/supabaseAdmin';
import InventoryTable from './InventoryTable';
import { getAnalytics, getProducts } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Get comprehensive analytics (includes ad spend, shipping, etc)
    const stats = await getAnalytics({ startDate, endDate: today });
    const products = await getProducts();
    const { data: suppliers } = await supabaseAdmin.from('suppliers').select('id, company_name').order('company_name');

    // Need raw purchase/sales totals for stock (ignoring date filter for current stock)
    const { data: purchases } = await supabaseAdmin.from('purchases').select('product_id, amount').eq('status', 'stoga_girdi');
    const { data: orders } = await supabaseAdmin.from('orders').select('product, package_id').eq('status', 'teyit_alindi');

    const purchaseMap: Record<string, number> = {};
    purchases?.forEach(p => { purchaseMap[p.product_id] = (purchaseMap[p.product_id] || 0) + (p.amount || 0); });

    const salesMap: Record<string, number> = {};
    orders?.forEach(o => {
        const key = (o.product || '').toLowerCase().trim();
        salesMap[key] = (salesMap[key] || 0) + (o.package_id || 1);
    });

    const productsWithStats = stats.productStats.map((ps: any) => {
        const prod = products?.find(p => p.id === ps.id);
        const totalPurchased = purchaseMap[ps.id] || 0;
        const totalSold = salesMap[ps.name.toLowerCase().trim()] || 0;

        return {
            ...prod,
            ...ps,
            totalPurchased,
            totalSold,
            calculatedStock: totalPurchased - totalSold,
            potentialProfit: ps.potentialNetProfit
        };
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Stok ve Ürün Yönetimi</h2>
                <p className="text-gray-500 mt-1 font-medium">Stok girişlerini takip edin ve ürün maliyetlerinizi yönetin.</p>
            </div>

            <InventoryTable
                initialProducts={productsWithStats || []}
                suppliers={suppliers || []}
            />
        </div>
    );
}
