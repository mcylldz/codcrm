'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export async function updateProduct(id: string, data: any) {
    const { error } = await supabaseAdmin
        .from('products')
        .update(data)
        .eq('id', id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/inventory');
    return { success: true };
}

export async function createProduct(data: any) {
    const { error } = await supabaseAdmin.from('products').insert(data);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/inventory');
    return { success: true };
}
