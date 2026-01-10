import { supabaseAdmin } from '@/lib/supabaseAdmin';
import InventoryTable from './InventoryTable';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const { data: products } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('name');

    const { data: purchases } = await supabaseAdmin
        .from('purchases')
        .select('product_id, amount, status')
        .eq('status', 'stoga_girdi');

    const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('product, package_id, status')
        .eq('status', 'teyit_alindi');

    // Calculate aggregates
    const purchaseMap: Record<string, number> = {};
    purchases?.forEach(p => {
        purchaseMap[p.product_id] = (purchaseMap[p.product_id] || 0) + (p.amount || 0);
    });

    const salesMap: Record<string, number> = {};
    orders?.forEach(o => {
        const key = (o.product || '').toLowerCase().trim();
        salesMap[key] = (salesMap[key] || 0) + (o.package_id || 1);
    });

    const { data: campaigns } = await supabaseAdmin.from('product_campaigns').select('*');

    const productsWithStats = products?.map(p => {
        const totalPurchased = purchaseMap[p.id] || 0;
        const totalSold = salesMap[p.name.toLowerCase().trim()] || 0;
        const productCampaigns = campaigns?.filter(c => c.product_id === p.id) || [];
        return {
            ...p,
            totalPurchased,
            totalSold,
            calculatedStock: totalPurchased - totalSold,
            campaigns: productCampaigns
        };
    });

    const { data: suppliers } = await supabaseAdmin.from('suppliers').select('id, company_name').order('company_name');

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
