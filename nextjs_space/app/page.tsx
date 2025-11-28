import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="mb-8 inline-block">
          <Heart className="h-20 w-20 text-[#ea580c]" />
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          ImpactusAll
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Connecting corporate generosity with charitable impact through powerful storytelling.
        </p>
        
        <div className="space-y-4">
          <Link href="/manchester-united">
            <Button size="lg" className="gradient-primary">
              View Manchester United Impact Hub
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <div className="pt-4 space-y-2">
            <Link href="/login">
              <Button variant="link" className="text-gray-600">
                Charity Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
