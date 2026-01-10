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
export async function getAnalytics(filters: {
    startDate?: string;
    endDate?: string;
    products?: string[];
}) {
    let query = supabaseAdmin.from('orders').select('*');

    if (filters.startDate) {
        query = query.gte('created_at', `${filters.startDate}T00:00:00.000Z`);
    }
    if (filters.endDate) {
        query = query.lte('created_at', `${filters.endDate}T23:59:59.999Z`);
    }
    if (filters.products && filters.products.length > 0) {
        // Handle products case-insensitively for filtering if needed
        // For now, assume it comes from a list. 
        query = query.in('product', filters.products);
    }

    const { data: orders, error: ordersError } = await query;
    if (ordersError) throw new Error(ordersError.message);

    const { data: productData, error: productError } = await supabaseAdmin.from('products').select('name, cost');
    if (productError) throw new Error(productError.message);

    // BUILD CASE-INSENSITIVE COST MAP
    const costMap = productData.reduce((acc, p) => {
        acc[p.name.toLowerCase().trim()] = Number(p.cost || 0);
        return acc;
    }, {} as Record<string, number>);

    const stats = {
        totalOrders: orders.length,
        statusCounts: {
            teyit_bekleniyor: 0,
            ulasilamadi: 0,
            teyit_alindi: 0,
            kabul_etmedi: 0,
        },
        grossTurnover: 0,
        netTurnover: 0,
        potentialTurnover: 0,
        lostTurnover: 0,
        totalCost: 0,
        netCost: 0,
    };

    const productStatsMap: Record<string, any> = {};

    orders.forEach(order => {
        const productKey = (order.product || '').toLowerCase().trim();
        const orderPrice = Number(order.total_price || 0);
        const productCost = costMap[productKey] || 0;
        const totalOrderCost = productCost * (order.package_id || 1);

        // Normalize name for display based on the product list if possible, or use order's text
        const displayName = order.product || 'Bilinmeyen Ürün';

        if (!productStatsMap[productKey]) {
            productStatsMap[productKey] = {
                name: displayName,
                orders: 0,
                confirmed: 0,
                turnover: 0,
                cost: 0,
            };
        }
        productStatsMap[productKey].orders++;
        if (order.status === 'teyit_alindi') {
            productStatsMap[productKey].turnover += orderPrice;
            productStatsMap[productKey].cost += totalOrderCost;
            productStatsMap[productKey].confirmed++;
        }

        stats.grossTurnover += orderPrice;
        stats.totalCost += totalOrderCost;

        if (order.status === 'teyit_alindi') {
            stats.statusCounts.teyit_alindi++;
            stats.netTurnover += orderPrice;
            stats.netCost += totalOrderCost;
        } else if (order.status === 'teyit_bekleniyor') {
            stats.statusCounts.teyit_bekleniyor++;
            stats.potentialTurnover += orderPrice;
        } else if (order.status === 'ulasilamadi') {
            stats.statusCounts.ulasilamadi++;
            stats.lostTurnover += orderPrice;
        } else if (order.status === 'kabul_etmedi') {
            stats.statusCounts.kabul_etmedi++;
            stats.lostTurnover += orderPrice;
        }
    });

    const netProfit = stats.netTurnover - stats.netCost;
    const grossMargin = stats.netTurnover > 0 ? (netProfit / stats.netTurnover) * 100 : 0;

    return {
        ...stats,
        netProfit,
        grossMargin,
        confirmedRate: stats.totalOrders > 0 ? (stats.statusCounts.teyit_alindi / stats.totalOrders) * 100 : 0,
        rejectedRate: stats.totalOrders > 0 ? ((stats.statusCounts.ulasilamadi + stats.statusCounts.kabul_etmedi) / stats.totalOrders) * 100 : 0,
        productStats: Object.values(productStatsMap).sort((a, b) => b.turnover - a.turnover),
    };
}
