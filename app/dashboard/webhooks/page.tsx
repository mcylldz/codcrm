import { supabaseAdmin } from '@/lib/supabaseAdmin';
import WebhookTable from './WebhookTable';

export const dynamic = 'force-dynamic';

export default async function WebhooksPage() {
    const { data: sources } = await supabaseAdmin
        .from('webhook_sources')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

    const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, name')
        .order('name');

    const { data: metaSettings } = await supabaseAdmin.from('meta_settings').select('*').single();

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Entegrasyon Yönetimi</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl">
                <p className="text-sm text-blue-800 font-medium">
                    Burada farklı kaynaklar için özel webhook linkleri oluşturabilir ve Meta Ads bağlantılarınızı yönetebilirsiniz.
                </p>
            </div>
            <WebhookTable
                initialSources={sources || []}
                products={products || []}
                metaSettings={metaSettings}
            />
        </div>
    );
}
