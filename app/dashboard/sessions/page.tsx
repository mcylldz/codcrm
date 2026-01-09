import { supabaseAdmin } from '@/lib/supabaseAdmin';
import SessionTable from './SessionTable';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SessionsPage({ searchParams }: { searchParams: { date?: string } }) {
    // Default to today in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const date = searchParams.date || today;

    // Fetch orders for this date
    const start = `${date}T00:00:00.000Z`;
    const end = `${date}T23:59:59.999Z`;

    const { data: orders, error } = await supabaseAdmin
        .from('orders')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end)
        .order('created_at', { ascending: true }); // Call list order probably by time

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Teyit Seansları</h2>

            <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center space-x-4">
                <label className="font-semibold text-gray-700">Teyit Günü Seç:</label>
                <form className="flex space-x-2">
                    <input
                        type="date"
                        name="date"
                        defaultValue={date}
                        className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Getir
                    </button>
                </form>
            </div>

            <SessionTable initialOrders={orders || []} selectedDate={date} />
        </div>
    );
}
