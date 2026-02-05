import HomePage from '@/components/home-page';
import { Suspense } from 'react';

// Force dynamic rendering to restart build process
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
