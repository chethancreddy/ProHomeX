'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { loginWithPassword } from '@/app/actions/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

type LoginMode = 'email-password' | 'sign-up';

export function LoginForm() {
  const [mode, setMode] = useState<LoginMode>('email-password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const supabase = createClient();

  const handleAction = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'email-password') {
        // Server action handles DB role lookup and redirect
        const result = await loginWithPassword(formData);
        if (result?.error) {
          setError(result.error);
        }
        return;
      } else if (mode === 'sign-up') {
        // Always sign up as CUSTOMER — admins are created manually in Supabase
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'CUSTOMER',
            }
          }
        });
        if (error) throw error;
        setSignupSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Account Created!</h3>
          <p className="text-sm text-gray-500 mt-2">
            Please check your email to confirm your account, then sign in.
          </p>
          <button
            onClick={() => { setSignupSuccess(false); setMode('email-password'); }}
            className="mt-5 w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Back to Sign In
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          {mode === 'sign-up' ? 'Create Account' : 'Sign In to ProHomeX'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form action={handleAction} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          {mode === 'sign-up' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            {mode === 'sign-up' ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          {mode === 'email-password' ? (
            <button type="button" onClick={() => { setMode('sign-up'); setError(null); }} className="text-sm text-blue-600 hover:underline">
              Don&apos;t have an account? Sign up
            </button>
          ) : (
            <button type="button" onClick={() => { setMode('email-password'); setError(null); }} className="text-sm text-blue-600 hover:underline">
              Already have an account? Sign in
            </button>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Admin? <Link href="/admin/login" className="text-blue-600 hover:underline">Sign in here →</Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
