'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function updateOrder(id: string, data: any) {
    try {
        // 1. Get current order to check previous status and product
        const { data: oldOrder, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // 2. Perform the update
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update(data)
            .eq('id', id);

        if (updateError) throw updateError;

        // 3. Stock Management Logic
        const oldStatus = oldOrder.status;
        const newStatus = data.status || oldStatus;
        const productName = (data.product || oldOrder.product || '').trim().toLowerCase();
        const quantity = Number(data.package_id || oldOrder.package_id || 1);

        // Fetch product case-insensitively
        const { data: product } = await supabaseAdmin
            .from('products')
            .select('id, name, stock')
            .ilike('name', productName)
            .single();

        if (product) {
            let stockChange = 0;

            // Transition To Confirmed: Decrease Stock
            if (newStatus === 'teyit_alindi' && oldStatus !== 'teyit_alindi') {
                stockChange = -quantity;
            }
            // Transition From Confirmed: Revert Stock
            else if (oldStatus === 'teyit_alindi' && newStatus !== 'teyit_alindi') {
                stockChange = quantity;
            }
            // Quantity change in an already confirmed order
            else if (oldStatus === 'teyit_alindi' && newStatus === 'teyit_alindi' && data.package_id) {
                stockChange = Number(oldOrder.package_id) - Number(data.package_id);
            }

            if (stockChange !== 0) {
                await supabaseAdmin
                    .from('products')
                    .update({ stock: (product.stock || 0) + stockChange })
                    .eq('id', product.id);
            }
        }

        revalidatePath('/dashboard/sessions');
        revalidatePath('/dashboard/orders');
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getOrders(filters: {
    status?: string[];
    excludeStatus?: string[];
    startDate?: string;
    endDate?: string;
    product?: string[];
    excludeProduct?: string[];
}) {
    let query = supabaseAdmin.from('orders').select('*');

    if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
    }
    if (filters.excludeStatus && filters.excludeStatus.length > 0) {
        query = query.not('status', 'in', `(${filters.excludeStatus.join(',')})`);
    }

    if (filters.startDate) {
        query = query.gte('created_at', `${filters.startDate}T00:00:00.000Z`);
    }
    if (filters.endDate) {
        query = query.lte('created_at', `${filters.endDate}T23:59:59.999Z`);
    }

    if (filters.product && filters.product.length > 0) {
        query = query.in('product', filters.product);
    }
    if (filters.excludeProduct && filters.excludeProduct.length > 0) {
        query = query.not('product', 'in', `(${filters.excludeProduct.join(',')})`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function getProducts() {
    const { data, error } = await supabaseAdmin.from('products').select('*').order('name');
    if (error) throw new Error(error.message);
    return data;
}

export async function getOrdersByDate(dateStr: string) {
    // dateStr is YYYY-MM-DD
    // We want orders created on this date (UTC)
    // Or based on local time? Usually timestamps are UTC.
    // "Bugünün tarihi ISO 8601 formatında seçili gelmelidir." -> 2024-06-16
    // We need to query range [date 00:00:00, date 23:59:59]
    // But since we store strict timestamp, we should probably assume user selects a "Report Day".
    // Or maybe just matching string prefix?
    // Supabase filtering: .gte('created_at', dateStr + 'T00:00:00') .lte ... 

    // Using start and end of day in UTC
    const start = `${dateStr}T00:00:00.000Z`;
    const end = `${dateStr}T23:59:59.999Z`;

    const { data, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: true }); // Call list order

    if (error) throw new Error(error.message);
    return data;
}
function calculateShippingCost(price: number) {
    if (price <= 500) return 150;
    if (price <= 1250) return 185;
    if (price <= 2500) return 220;
    if (price <= 3750) return 270;
    if (price <= 5000) return 310;
    return 310;
}

async function getMetaInsights(filters: { startDate?: string; endDate?: string }, campaignCodes?: string[]) {
    try {
        const { data: settings } = await supabaseAdmin.from('meta_settings').select('*').single();
        if (!settings?.access_token || !settings?.ad_account_id) return null;

        const adAccountId = settings.ad_account_id.startsWith('act_') ? settings.ad_account_id : `act_${settings.ad_account_id}`;

        const baseUrl = `https://graph.facebook.com/v18.0/${adAccountId}/insights`;
        const params = new URLSearchParams({
            fields: 'spend,cpc,cpm,campaign_name,campaign_id,impressions,clicks,actions',
            access_token: settings.access_token,
            level: 'campaign'
        });

        if (filters.startDate && filters.endDate) {
            params.append('time_range', JSON.stringify({ since: filters.startDate, until: filters.endDate }));
        }

        const finalUrl = `${baseUrl}?${params.toString()}`;
        const res = await fetch(finalUrl, { cache: 'no-store' });
        const json = await res.json();

        if (json.error) return null;

        let spend = 0;
        let cpcSum = 0;
        let cpcCount = 0;
        let cpmSum = 0;
        let cpmCount = 0;
        let landingPageViews = 0;

        const data = json.data || [];
        const cleanCodes = (campaignCodes || []).map(c => c.trim().toLowerCase()).filter(c => c !== '');

        const filteredCampaigns = cleanCodes.length > 0
            ? data.filter((item: any) => {
                const campaignName = (item.campaign_name || '').toLowerCase();
                const campaignId = (item.id || item.campaign_id || '').toLowerCase();
                return cleanCodes.some(code => campaignName.includes(code) || campaignId === code);
            })
            : data;

        const campaignMap: Record<string, number> = {};

        filteredCampaigns.forEach((item: any) => {
            const itemSpend = Number(item.spend || 0);
            spend += itemSpend;

            if (cleanCodes.length > 0) {
                const matchingCode = cleanCodes.find(code =>
                    (item.campaign_name || '').toLowerCase().includes(code) ||
                    (item.id || item.campaign_id || '').toLowerCase() === code
                );
                if (matchingCode) {
                    campaignMap[matchingCode] = (campaignMap[matchingCode] || 0) + itemSpend;
                }
            }

            if (item.cpc) { cpcSum += Number(item.cpc); cpcCount++; }
            if (item.cpm) { cpmSum += Number(item.cpm); cpmCount++; }

            if (item.actions) {
                const lpv = item.actions.find((a: any) => a.action_type === 'landing_page_view');
                if (lpv) landingPageViews += Number(lpv.value || 0);
            }
        });

        return {
            spend,
            cpc: cpcCount > 0 ? cpcSum / cpcCount : 0,
            cpm: cpmCount > 0 ? cpmSum / cpmCount : 0,
            landingPageViews,
            campaignMap
        };
    } catch (e) {
        return null;
    }
}

export async function getAnalytics(filters: {
    startDate?: string;
    endDate?: string;
    products?: string[];
}) {
    let query = supabaseAdmin.from('orders').select('*');
    if (filters.startDate) query = query.gte('created_at', `${filters.startDate}T00:00:00.000Z`);
    if (filters.endDate) query = query.lte('created_at', `${filters.endDate}T23:59:59.999Z`);
    if (filters.products && filters.products.length > 0) query = query.in('product', filters.products);
    const { data: orders } = await query;

    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const { data: historicalOrders } = await supabaseAdmin
        .from('orders')
        .select('product, package_id, created_at')
        .eq('status', 'teyit_alindi')
        .gte('created_at', fourDaysAgo.toISOString());

    const { data: productData } = await supabaseAdmin.from('products').select('*');
    const { data: campaignData } = await supabaseAdmin.from('product_campaigns').select('*');
    const { data: allPurchases } = await supabaseAdmin.from('purchases').select('product_id, amount').eq('status', 'stoga_girdi');
    const { data: allSold } = await supabaseAdmin.from('orders').select('product, package_id').eq('status', 'teyit_alindi');

    const stockMap: Record<string, number> = {};
    productData?.forEach(p => {
        const totalIn = allPurchases?.filter(pur => pur.product_id === p.id).reduce((sum, curr) => sum + (curr.amount || 0), 0) || 0;
        const totalOut = allSold?.filter(s => (s.product || '').toLowerCase().trim() === p.name.toLowerCase().trim()).reduce((sum, curr) => sum + (curr.package_id || 1), 0) || 0;
        stockMap[p.id] = totalIn - totalOut;
    });

    const velocityMap: Record<string, number> = {};
    historicalOrders?.forEach(o => {
        const key = (o.product || '').toLowerCase().trim();
        velocityMap[key] = (velocityMap[key] || 0) + (o.package_id || 1);
    });
    Object.keys(velocityMap).forEach(k => velocityMap[k] = velocityMap[k] / 4);

    let codesToFilter: string[] = [];
    if (filters.products && filters.products.length > 0) {
        const selectedProdIds = productData?.filter(p => filters.products!.includes(p.name)).map(p => p.id) || [];
        codesToFilter = campaignData?.filter(c => selectedProdIds.includes(c.product_id)).map(c => c.campaign_code) || [];
    }

    const metaInsights = await getMetaInsights({ startDate: filters.startDate, endDate: filters.endDate }, codesToFilter);

    const stats = {
        totalOrders: orders?.length || 0,
        confirmedOrders: 0,
        statusCounts: { teyit_bekleniyor: 0, ulasilamadi: 0, teyit_alindi: 0, kabul_etmedi: 0 },
        grossTurnover: 0,
        netTurnover: 0,
        totalCost: 0,
        netCost: 0,
        totalShipping: 0,
        adSpend: metaInsights?.spend || 0,
        cpc: metaInsights?.cpc || 0,
        cpm: metaInsights?.cpm || 0,
        lpv: metaInsights?.landingPageViews || 0,
        productStats: [] as any[]
    };

    const productStatsMap: Record<string, any> = {};

    orders?.forEach(order => {
        const pData = productData?.find(p => p.name.toLowerCase().trim() === (order.product || '').toLowerCase().trim());
        const productKey = (order.product || '').toLowerCase().trim();
        const price = Number(order.total_price || 0);
        const cost = Number(pData?.cost || 0) * (order.package_id || 1);

        if (!productStatsMap[productKey]) {
            productStatsMap[productKey] = {
                id: pData?.id,
                name: order.product || 'Bilinmeyen',
                orders: 0, confirmed: 0,
                grossTurnover: 0, netTurnover: 0,
                grossCost: 0, netCost: 0,
                shipping: 0,
                adSpend: 0
            };
        }

        const pStat = productStatsMap[productKey];
        pStat.orders++;
        pStat.grossTurnover += price;
        pStat.grossCost += cost;
        stats.grossTurnover += price;
        stats.totalCost += cost;

        if (order.status === 'teyit_alindi') {
            const ship = calculateShippingCost(price);
            pStat.confirmed++;
            pStat.netTurnover += price;
            pStat.netCost += cost;
            pStat.shipping += ship;

            stats.confirmedOrders++;
            stats.netTurnover += price;
            stats.netCost += cost;
            stats.totalShipping += ship;
            stats.statusCounts.teyit_alindi++;
        } else if (stats.statusCounts[order.status as keyof typeof stats.statusCounts] !== undefined) {
            stats.statusCounts[order.status as keyof typeof stats.statusCounts]++;
        }
    });

    if (metaInsights?.campaignMap) {
        Object.keys(productStatsMap).forEach(pKey => {
            const pId = productStatsMap[pKey].id;
            const pCodes = campaignData?.filter(c => c.product_id === pId).map(c => c.campaign_code.toLowerCase()) || [];
            pCodes.forEach(code => {
                productStatsMap[pKey].adSpend += (metaInsights.campaignMap[code] || 0);
            });
        });
    }

    stats.productStats = Object.values(productStatsMap).map(p => {
        const netProfit = p.netTurnover - p.netCost - p.shipping - p.adSpend;
        const grossProfit = p.grossTurnover - p.grossCost;
        const currentStock = stockMap[p.id] || 0;
        const dailyVel = velocityMap[p.name.toLowerCase().trim()] || 0;

        // Calculate actual units sold from package_id totals
        const totalUnitsSold = orders?.filter(o =>
            o.status === 'teyit_alindi' &&
            (o.product || '').toLowerCase().trim() === p.name.toLowerCase().trim()
        ).reduce((sum, o) => sum + (o.package_id || 1), 0) || 1;

        return {
            ...p,
            netProfit,
            grossProfit,
            totalUnitsSold,
            netProfitPerOrder: p.confirmed > 0 ? netProfit / p.confirmed : 0,
            netProfitPerUnit: totalUnitsSold > 0 ? netProfit / totalUnitsSold : 0,
            grossCac: p.orders > 0 ? p.adSpend / p.orders : 0,
            netCac: p.confirmed > 0 ? p.adSpend / p.confirmed : 0,
            margin: p.netTurnover > 0 ? (netProfit / p.netTurnover) * 100 : 0,
            stockDays: dailyVel > 0 ? Math.max(0, Math.floor(currentStock / dailyVel)) : Infinity,
            roas: p.adSpend > 0 ? p.netTurnover / p.adSpend : 0,
        };
    }).sort((a, b) => b.netTurnover - a.netTurnover);

    const netProfit = stats.netTurnover - stats.netCost - stats.totalShipping - stats.adSpend;
    const grossProfit = stats.grossTurnover - stats.totalCost;
    const totalInvestment = stats.netCost + stats.totalShipping + stats.adSpend;

    return {
        ...stats,
        netProfit,
        grossProfit,
        netMargin: stats.netTurnover > 0 ? (netProfit / stats.netTurnover) * 100 : 0,
        convRate: stats.lpv > 0 ? (stats.totalOrders / stats.lpv) * 100 : 0,
        grossCac: stats.totalOrders > 0 ? stats.adSpend / stats.totalOrders : 0,
        netCac: stats.confirmedOrders > 0 ? stats.adSpend / stats.confirmedOrders : 0,
        roas: stats.adSpend > 0 ? stats.netTurnover / stats.adSpend : 0,
        roi: totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0,
    };
}
