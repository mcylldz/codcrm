import { redirect } from 'next/navigation';

export default function Page() {
    // Redirect main dashboard to pending for now, or stats
    redirect('/dashboard/pending');
}
