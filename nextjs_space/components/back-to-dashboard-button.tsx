'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackToDashboardButtonProps {
  donorSlug: string;
  donorName: string;
  donorLogo?: string | null;
  primaryColor?: string;
}

export function BackToDashboardButton({ 
  donorSlug, 
  donorName,
  donorLogo,
  primaryColor 
}: BackToDashboardButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromDashboard = searchParams.get('ref') === 'dashboard';

  const handleBack = () => {
    if (fromDashboard) {
      router.push('/corporate-dashboard');
    } else {
      router.push(`/${donorSlug}`);
    }
  };

  return (
    <Button
      onClick={handleBack}
      variant="ghost"
      className="flex items-center gap-2 text-white hover:bg-white/20 transition-colors"
    >
      <ArrowLeft className="h-5 w-5" />
      <span>Back to {fromDashboard ? 'Dashboard' : donorName}</span>
    </Button>
  );
}
