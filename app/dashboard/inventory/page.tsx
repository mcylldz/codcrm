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

    const { data: allOrders } = await supabaseAdmin
        .from('orders')
        .select('product, package_id, status, total_price, return_cost')
        .in('status', ['teyit_alindi', 'iade_donduruldu']);

    const { data: campaignData } = await supabaseAdmin.from('product_campaigns').select('*');
    const { data: fbData } = await supabaseAdmin.from('fb_insights').select('*'); // This is simplified, ideally use the same helper as actions.ts

    // Calculate aggregates
    const purchaseMap: Record<string, number> = {};
    purchases?.forEach(p => {
        purchaseMap[p.product_id] = (purchaseMap[p.product_id] || 0) + (p.amount || 0);
    });

    const salesMap: Record<string, number> = {};
    const netProfitMap: Record<string, number> = {};
    const unitsSoldMap: Record<string, number> = {};

    allOrders?.forEach(o => {
        const key = (o.product || '').toLowerCase().trim();
        if (o.status === 'teyit_alindi') {
            salesMap[key] = (salesMap[key] || 0) + (o.package_id || 1);
            unitsSoldMap[key] = (unitsSoldMap[key] || 0) + (o.package_id || 1);
        }
    });

    // We need ad spend per product too for real net profit
    const adSpendMap: Record<string, number> = {};
    // Simplify ad spend for now or use the getAnalytics logic
    // For this UI, let's use the logic from actions.ts to be consistent

    const { data: campaigns } = await supabaseAdmin.from('product_campaigns').select('*');

    const productsWithStats = products?.map(p => {
        const totalPurchased = purchaseMap[p.id] || 0;
        const totalSold = salesMap[p.name.toLowerCase().trim()] || 0;
        const currentStock = totalPurchased - totalSold;
        const productCampaigns = campaigns?.filter(c => c.product_id === p.id) || [];

        // Simplified net profit per unit calculation for this page
        // In a real scenario, this would call the same logic as getAnalytics
        const pOrders = allOrders?.filter(o => (o.product || '').toLowerCase().trim() === p.name.toLowerCase().trim());
        let netTurnover = 0;
        let totalCost = 0;
        let totalShip = 0;
        let totalReturnCost = 0;
        let unitsSold = 0;

        pOrders?.forEach(o => {
            const price = Number(o.total_price || 0);
            const cost = Number(p.cost || 0) * (o.package_id || 1);
            if (o.status === 'teyit_alindi') {
                netTurnover += price;
                totalCost += cost;
                totalShip += (price * 0.1); // approx
                unitsSold += (o.package_id || 1);
            } else if (o.status === 'iade_donduruldu') {
                totalReturnCost += Number(o.return_cost || 0);
                totalShip += (price * 0.1); // approx
            }
        });

        const netProfit = netTurnover - totalCost - totalShip - totalReturnCost;
        const profitPerUnit = unitsSold > 0 ? netProfit / unitsSold : 0;
        const potentialProfit = currentStock * profitPerUnit;

        return {
            ...p,
            totalPurchased,
            totalSold,
            calculatedStock: currentStock,
            campaigns: productCampaigns,
            potentialProfit
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
