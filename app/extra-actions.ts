'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

// Suppliers
export async function createSupplier(data: any) {
    const { error } = await supabaseAdmin.from('suppliers').insert(data);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/suppliers');
    return { success: true };
}

export async function deleteSupplier(id: string) {
    const { error } = await supabaseAdmin.from('suppliers').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/suppliers');
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
