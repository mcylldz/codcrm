'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

// Suppliers
export async function createSupplier(data: { company_name: string; contact_name: string; contact_phone: string; product_ids: string[] }) {
    const { product_ids, ...supplierData } = data;

    const { data: supplier, error } = await supabaseAdmin.from('suppliers').insert(supplierData).select().single();
    if (error) return { success: false, error: error.message };

    if (product_ids && product_ids.length > 0) {
        const mappings = product_ids.map(pid => ({ supplier_id: supplier.id, product_id: pid }));
        const { error: mapError } = await supabaseAdmin.from('supplier_products').insert(mappings);
        if (mapError) return { success: false, error: mapError.message };
    }

    revalidatePath('/dashboard/suppliers');
    return { success: true };
}

export async function deleteSupplier(id: string) {
    const { error } = await supabaseAdmin.from('suppliers').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/suppliers');
    return { success: true };
}

// Purchases
export async function createPurchase(data: any) {
    const { error } = await supabaseAdmin.from('purchases').insert({
        ...data,
        status: data.status || 'yolda'
    });

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard/suppliers');
    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function updatePurchase(id: string, data: any) {
    const { error } = await supabaseAdmin.from('purchases').update(data).eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/suppliers');
    return { success: true };
}

export async function deletePurchase(id: string) {
    const { error } = await supabaseAdmin.from('purchases').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/suppliers');
    return { success: true };
}

export async function confirmPurchase(purchaseId: string) {
    const { data: purchase, error: getError } = await supabaseAdmin
        .from('purchases')
        .select('*')
        .eq('id', purchaseId)
        .single();

    if (getError) return { success: false, error: getError.message };
    if (purchase.status === 'stoga_girdi') return { success: false, error: 'Bu işlem zaten tamamlanmış.' };

    const { data: product, error: prodError } = await supabaseAdmin
        .from('products')
        .select('stock')
        .eq('id', purchase.product_id)
        .single();

    if (prodError) return { success: false, error: prodError.message };

    const { error: stockError } = await supabaseAdmin
        .from('products')
        .update({ stock: (product.stock || 0) + purchase.amount })
        .eq('id', purchase.product_id);

    if (stockError) return { success: false, error: stockError.message };

    const { error: updateError } = await supabaseAdmin
        .from('purchases')
        .update({ status: 'stoga_girdi' })
        .eq('id', purchaseId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath('/dashboard/suppliers');
    revalidatePath('/dashboard/inventory');
    return { success: true };
}

// Webhooks
export async function createWebhookSource(name: string, product_id: string) {
    const { error } = await supabaseAdmin.from('webhook_sources').insert({ name, product_id });
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/webhooks');
    return { success: true };
}

export async function deleteWebhookSource(id: string) {
    const { error } = await supabaseAdmin.from('webhook_sources').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/webhooks');
    return { success: true };
}

// Meta Settings
export async function getMetaSettings() {
    const { data } = await supabaseAdmin.from('meta_settings').select('*').single();
    return data;
}

export async function updateMetaSettings(data: { access_token: string, business_id: string, ad_account_id: string }) {
    const { data: existing } = await supabaseAdmin.from('meta_settings').select('id').single();

    let res;
    if (existing) {
        res = await supabaseAdmin.from('meta_settings').update({ ...data, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
        res = await supabaseAdmin.from('meta_settings').insert(data);
    }

    if (res.error) return { success: false, error: res.error.message };
    revalidatePath('/dashboard/webhooks');
    return { success: true };
}

// Product Campaigns
export async function addProductCampaign(productId: string, code: string) {
    const { error } = await supabaseAdmin.from('product_campaigns').insert({ product_id: productId, campaign_code: code });
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/inventory');
    return { success: true };
}

export async function deleteProductCampaign(id: string) {
    const { error } = await supabaseAdmin.from('product_campaigns').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/inventory');
    return { success: true };
}

