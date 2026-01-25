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

export async function deleteOrder(id: string) {
    try {
        // 1. Get order details before deletion (for stock restoration)
        const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // 2. If order was confirmed, restore stock
        if (order.status === 'teyit_alindi') {
            const productName = (order.product || '').trim().toLowerCase();
            const quantity = Number(order.package_id || 1);

            const { data: product } = await supabaseAdmin
                .from('products')
                .select('id, name, stock')
                .ilike('name', productName)
                .single();

            if (product) {
                await supabaseAdmin
                    .from('products')
                    .update({ stock: product.stock + quantity })
                    .eq('id', product.id);
            }
        }

        // 3. Delete the order
        const { error: deleteError } = await supabaseAdmin
            .from('orders')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        revalidatePath('/teyit-seanslari');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting order:', error);
        return { success: false, error: error.message };
    }
}

export async function processReturnsFromExcel(excelData: { phone: string; returnCost: number; kColumnValue?: number; iColumnValue?: number }[]) {
    try {
        const results = {
            processed: 0,
            skipped: 0,
            notFound: 0,
            errors: [] as string[],
            details: [] as any[],
        };

        // 1. Fetch ALL orders (confirmed or returned) to check for duplicates and process returns
        // We need to check if a return was ALREADY processed for a phone number.
        // The user said: "yüklenen exceldeki telefon numarasından daha önceden iade girilip girilmediğini kontrol etsin."
        // This implies looking at ALL orders to see if any order with this phone is already 'iade_donduruldu' ??
        // OR just if we have processed this specific person before?
        // Assuming: If any order for this phone number is ALREADY in 'iade_donduruldu', skip it.

        const { data: allOrders, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*');

        if (fetchError) throw fetchError;

        for (const item of excelData) {
            try {
                // Clean input phone
                const inputPhone = item.phone.replace(/\D/g, '').slice(-10);
                if (inputPhone.length < 10) continue;

                // Find matching orders
                const matchingOrders = (allOrders || []).filter(order => {
                    const dbPhone = (order.phone || '').replace(/\D/g, '').slice(-10);
                    return dbPhone === inputPhone;
                });

                if (matchingOrders.length === 0) {
                    results.notFound++;
                    results.details.push({ phone: item.phone, status: 'not_found' });
                    continue;
                }

                // CHECK FOR DUPLICATE RETURN
                const alreadyReturned = matchingOrders.some(o => o.status === 'iade_donduruldu');
                if (alreadyReturned) {
                    results.skipped++;
                    results.details.push({ phone: item.phone, status: 'skipped_already_returned' });
                    continue;
                }

                // Filter to find the 'teyit_alindi' one to process (if multiple, we might pick the latest or all? Usually one active order)
                // If there is no 'teyit_alindi' order but there are others (e.g. 'teyit_bekleniyor'), we can't 'return' them potentially?
                // Logic: Find 'teyit_alindi' order to mark as returned.
                const orderToReturn = matchingOrders.find(o => o.status === 'teyit_alindi');

                if (!orderToReturn) {
                    // exists but not confirmed?
                    results.skipped++; // or not_found_confirmed
                    results.details.push({ phone: item.phone, status: 'no_confirmed_order_found' });
                    continue;
                }

                // CALCULATE RETURN COST
                // Logic: K sütunu (kColumnValue) - I Satırındaki (iColumnValue) = Cost
                // If not provided, fallback to item.returnCost (old way) or 0
                let calculatedReturnCost = item.returnCost;
                if (item.kColumnValue !== undefined && item.iColumnValue !== undefined) {
                    calculatedReturnCost = Number(item.kColumnValue) - Number(item.iColumnValue);
                }

                // Process the order
                const { error: updateError } = await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'iade_donduruldu',
                        return_cost: calculatedReturnCost,
                        return_processed: true,
                        return_date: new Date().toISOString(),
                    })
                    .eq('id', orderToReturn.id);

                if (updateError) {
                    results.errors.push(`Update error for order ${orderToReturn.id}: ${updateError.message}`);
                    continue;
                }

                // Restore stock
                const productName = (orderToReturn.product || '').trim().toLowerCase();
                const quantity = Number(orderToReturn.package_id || 1);

                const { data: product } = await supabaseAdmin
                    .from('products')
                    .select('id, name, stock')
                    .ilike('name', productName)
                    .single();

                if (product) {
                    await supabaseAdmin
                        .from('products')
                        .update({ stock: (product.stock || 0) + quantity })
                        .eq('id', product.id);
                }

                results.processed++;
                results.details.push({
                    phone: item.phone,
                    orderId: orderToReturn.id,
                    product: orderToReturn.product,
                    returnCost: calculatedReturnCost,
                    status: 'processed',
                });

            } catch (err: any) {
                results.errors.push(`Processing error for ${item.phone}: ${err.message}`);
            }
        }

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/orders');

        return { success: true, results };
    } catch (error: any) {
        console.error('Error processing returns:', error);
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
    search?: string;
    tags?: string[];
    excludeTags?: string[];
    page?: number;     // Added for pagination
    limit?: number;    // Added for pagination
}) {
    // Start building the query with a count
    let query = supabaseAdmin.from('orders').select('*', { count: 'exact' });

    if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,surname.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    }

    if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
    }
    if (filters.excludeStatus && filters.excludeStatus.length > 0) {
        query = query.not('status', 'in', `(${filters.excludeStatus.join(',')})`);
    }

    if (filters.tags && filters.tags.length > 0) {
        // filter by tags overlap (OR logic: contains at least one of the selected tags)
        query = query.overlaps('tags', filters.tags);
    }
    if (filters.excludeTags && filters.excludeTags.length > 0) {
        query = query.not('tags', 'overlaps', filters.excludeTags);
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

    // Pagination logic
    const page = filters.page || 1;
    const limit = filters.limit || 50; // Default limit 50
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw new Error(error.message);

    return { data, count, page, limit, totalPages: Math.ceil((count || 0) / limit) };
}

export async function getProducts() {
    const { data, error } = await supabaseAdmin.from('products').select('*').order('name');
    if (error) throw new Error(error.message);
    return data;
}

export async function getUniqueTags() {
    try {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select('tags')
            .not('tags', 'is', null);

        if (error) throw error;

        const allTags = new Set<string>();
        data.forEach(order => {
            if (Array.isArray(order.tags)) {
                order.tags.forEach(tag => allTags.add(tag));
            }
        });

        return Array.from(allTags).sort();
    } catch (error) {
        console.error('Error fetching tags:', error);
        return ['Sisteme Girildi']; // Fallback
    }
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

    // Always get campaign codes - either filtered by selected products or all codes
    let codesToFilter: string[] = [];
    if (filters.products && filters.products.length > 0) {
        const selectedProdIds = productData?.filter(p => filters.products!.includes(p.name)).map(p => p.id) || [];
        codesToFilter = campaignData?.filter(c => selectedProdIds.includes(c.product_id)).map(c => c.campaign_code) || [];
    } else {
        // No product filter = get all campaign codes
        codesToFilter = campaignData?.map(c => c.campaign_code) || [];
    }

    const metaInsights = await getMetaInsights({ startDate: filters.startDate, endDate: filters.endDate }, codesToFilter);

    const stats = {
        totalOrders: orders?.length || 0,
        confirmedOrders: 0,
        returnedOrders: 0,
        returnedUnits: 0,
        statusCounts: { teyit_bekleniyor: 0, ulasilamadi: 0, teyit_alindi: 0, kabul_etmedi: 0, iade_donduruldu: 0 },
        grossTurnover: 0,
        netTurnover: 0,
        totalCost: 0,
        costOfShippedOrders: 0,
        netCost: 0,
        totalShipping: 0,
        totalReturnCost: 0,
        adSpend: metaInsights?.spend || 0,
        cpc: metaInsights?.cpc || 0,
        cpm: metaInsights?.cpm || 0,
        lpv: metaInsights?.landingPageViews || 0,
        productStats: [] as any[]
    };

    const productStatsMap: Record<string, any> = {};
    productData?.forEach(p => {
        productStatsMap[p.name.toLowerCase().trim()] = {
            id: p.id,
            name: p.name,
            orders: 0, confirmed: 0, returned: 0, returnedUnits: 0,
            grossTurnover: 0, netTurnover: 0,
            grossCost: 0, netCost: 0,
            shipping: 0,
            returnCost: 0,
            adSpend: 0
        };
    });

    orders?.forEach(order => {
        const productKey = (order.product || '').toLowerCase().trim();
        if (!productStatsMap[productKey]) {
            // Fallback for products not in the products table
            productStatsMap[productKey] = {
                id: null,
                name: order.product || 'Bilinmeyen',
                orders: 0, confirmed: 0, returned: 0, returnedUnits: 0,
                grossTurnover: 0, netTurnover: 0,
                grossCost: 0, netCost: 0,
                shipping: 0,
                returnCost: 0,
                adSpend: 0
            };
        }
        const pData = productData?.find(p => p.name.toLowerCase().trim() === productKey);

        const pStat = productStatsMap[productKey];
        const price = Number(order.total_price || 0);
        const cost = Number(pData?.cost || 0) * (order.package_id || 1);
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
            stats.costOfShippedOrders += cost;
            stats.totalShipping += ship;
            stats.statusCounts.teyit_alindi++;
        } else if (order.status === 'iade_donduruldu') {
            const returnCost = Number(order.return_cost || 0);
            const ship = calculateShippingCost(price);
            const units = Number(order.package_id || 1);
            pStat.returned++;
            pStat.returnedUnits += units;
            pStat.returnCost += returnCost;
            pStat.shipping += ship;
            // Note: netTurnover and netCost are for confirmed orders. 
            // Returned orders stay in gross but don't add to net revenue.
            // Their costs (product + ship + returnCost) are subtracted from Net Profit at the end.

            stats.returnedOrders++;
            stats.returnedUnits += units;
            stats.costOfShippedOrders += cost;
            stats.totalShipping += ship;
            stats.totalReturnCost += returnCost;
            stats.statusCounts.iade_donduruldu++;
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
        const netProfit = p.netTurnover - p.netCost - p.shipping - p.adSpend - p.returnCost;
        const grossProfit = p.grossTurnover - p.grossCost;
        const currentStock = stockMap[p.id] || 0;
        const dailyVel = velocityMap[p.name.toLowerCase().trim()] || 0;

        // Calculate actual units sold from package_id totals
        const totalUnitsSold = orders?.filter(o =>
            o.status === 'teyit_alindi' &&
            (o.product || '').toLowerCase().trim() === p.name.toLowerCase().trim()
        ).reduce((sum, o) => sum + (o.package_id || 1), 0) || 1;

        const returnRate = (p.returned / (p.confirmed + p.returned)) * 100 || 0;

        return {
            ...p,
            netProfit,
            grossProfit,
            totalUnitsSold,
            returnRate,
            netProfitPerOrder: p.confirmed > 0 ? netProfit / p.confirmed : 0,
            netProfitPerUnit: totalUnitsSold > 0 ? netProfit / totalUnitsSold : 0,
            grossCac: p.orders > 0 ? p.adSpend / p.orders : 0,
            netCac: p.confirmed > 0 ? p.adSpend / p.confirmed : 0,
            margin: p.netTurnover > 0 ? (netProfit / p.netTurnover) * 100 : 0,
            stockDays: dailyVel > 0 ? Math.max(0, Math.floor(currentStock / dailyVel)) : Infinity,
            roas: p.adSpend > 0 ? p.netTurnover / p.adSpend : 0,
            potentialNetProfit: currentStock * (totalUnitsSold > 0 ? netProfit / totalUnitsSold : 0)
        };
    }).sort((a, b) => b.netTurnover - a.netTurnover);

    const netProfit = stats.netTurnover - stats.costOfShippedOrders - stats.totalShipping - stats.adSpend - stats.totalReturnCost;
    const grossProfit = stats.grossTurnover - stats.totalCost;
    const totalInvestment = stats.netCost + stats.totalShipping + stats.adSpend + stats.totalReturnCost;
    const returnRate = (stats.returnedOrders / (stats.confirmedOrders + stats.returnedOrders)) * 100 || 0;

    return {
        ...stats,
        netProfit,
        grossProfit,
        returnRate,
        netMargin: stats.netTurnover > 0 ? (netProfit / stats.netTurnover) * 100 : 0,
        convRate: stats.lpv > 0 ? (stats.totalOrders / stats.lpv) * 100 : 0,
        grossCac: stats.totalOrders > 0 ? stats.adSpend / stats.totalOrders : 0,
        netCac: stats.confirmedOrders > 0 ? stats.adSpend / stats.confirmedOrders : 0,
        roas: stats.adSpend > 0 ? stats.netTurnover / stats.adSpend : 0,
        roi: totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0,
        potentialNetProfit: Object.values(productStatsMap).reduce((sum, p) => {
            const currentStock = stockMap[p.id] || 0;
            const netProfit = p.netTurnover - p.netCost - p.shipping - p.adSpend - p.returnCost;
            const totalUnitsSold = orders?.filter(o =>
                o.status === 'teyit_alindi' &&
                (o.product || '').toLowerCase().trim() === p.name.toLowerCase().trim()
            ).reduce((s, o) => s + (o.package_id || 1), 0) || 0;
            return sum + (currentStock * (totalUnitsSold > 0 ? netProfit / totalUnitsSold : 0));
        }, 0)
    };
}
