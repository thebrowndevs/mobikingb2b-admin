"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function Page() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/website-layout');
    }, [router]);

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-back1">
            <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
        </div>
    );
}

export default Page;