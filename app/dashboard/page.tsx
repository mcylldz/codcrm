import { redirect } from 'next/navigation';

export default function Page() {
    // Redirect main dashboard to orders for now, or stats
    redirect('/dashboard/orders');
}
