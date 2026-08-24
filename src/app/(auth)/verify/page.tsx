'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';

function VerifyOTPForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const email = searchParams.get('email');
  const phone = searchParams.get('phone');
  
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (email) {
        result = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        });
      } else if (phone) {
        result = await supabase.auth.verifyOtp({
          phone,
          token,
          type: 'sms',
        });
      } else {
        throw new Error('No email or phone number provided to verify.');
      }

      if (result.error) throw result.error;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Verify your code</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-center text-gray-600 mb-6">
          We sent a verification code to <span className="font-semibold text-gray-900">{email || phone}</span>.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Verify
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <button 
          onClick={() => router.push('/login')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Back to Login
        </button>
      </CardFooter>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <VerifyOTPForm />
      </Suspense>
    </div>
  );
}
