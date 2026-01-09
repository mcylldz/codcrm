import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
    const { data: suppliers } = await supabaseAdmin
        .from('suppliers')
        .select('*')
        .order('company_name');

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Tedarikçi Yönetimi</h2>
            <div className="bg-white p-6 rounded shadow">
                <p className="text-gray-500 text-sm mb-4">Bu alan şu an sadece veritabanı altyapısı olarak mevcuttur. Tedarikçi ekleme arayüzü eklenecektir.</p>
                <h3 className="font-bold mb-2">Mevcut Tedarikçiler:</h3>
                <ul className="list-disc list-inside">
                    {suppliers?.map(s => <li key={s.id}>{s.company_name} ({s.contact_name})</li>)}
                    {(!suppliers || suppliers.length === 0) && <li className="text-gray-400">Kayıtlı tedarikçi yok.</li>}
                </ul>
            </div>
        </div>
    );
}
