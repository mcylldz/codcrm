'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        document.cookie = "auth_session=; path=/; max-age=0";
        router.push('/login');
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-600 p-2 rounded hover:bg-red-50 w-full transition-colors"
        >
            <LogOut size={20} />
            <span>Çıkış Yap</span>
        </button>
    );
}
