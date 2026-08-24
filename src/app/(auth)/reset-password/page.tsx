'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
        </CardHeader>
        
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
                Check your email for a password reset link.
              </div>
              <Button onClick={() => router.push('/login')} variant="secondary" className="w-full">
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Enter your email address and we will send you a link to reset your password.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Send Reset Link
              </Button>
            </form>
          )}
        </CardContent>

        {!success && (
          <CardFooter className="justify-center">
            <button 
              onClick={() => router.push('/login')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Back to Login
            </button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
