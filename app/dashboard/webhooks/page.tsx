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

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Webhook Entegrasyon Yönetimi</h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-blue-700">
                    Burada farklı kaynaklar (reklamlar vb.) için özel webhook linkleri oluşturabilirsiniz.
                    Oluşturduğunuz linki n8n veya diğer servislere girdiğinizde, gelen sipariş otomatik olarak seçilen ürünle eşleştirilecektir.
                </p>
            </div>
            <WebhookTable initialSources={sources || []} products={products || []} />
        </div>
    );
}
