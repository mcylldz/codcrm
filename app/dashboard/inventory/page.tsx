import { supabaseAdmin } from '@/lib/supabaseAdmin';
import InventoryTable from './InventoryTable';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
    const { data: products } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('name');

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Stok ve Ürün Yönetimi</h2>
            <InventoryTable initialProducts={products || []} />
        </div>
    );
}
