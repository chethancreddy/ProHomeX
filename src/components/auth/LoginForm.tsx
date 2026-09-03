'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { loginWithPassword } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Check } from 'lucide-react';

type LoginMode = 'email-password' | 'sign-up' | 'otp';

export function LoginForm() {
  const [mode, setMode] = useState<LoginMode>('email-password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [token, setToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'email-password') {
        const formData = new FormData(e.currentTarget);
        const result = await loginWithPassword(formData);
        if (result?.error) {
          setError(result.error);
        }
      } else if (mode === 'sign-up') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: 'CUSTOMER' }
          }
        });
        if (error) throw error;
        setSignupSuccess(true);
      } else if (mode === 'otp') {
        if (!otpSent) {
          const { error } = await supabase.auth.signInWithOtp({ email });
          if (error) throw error;
          setOtpSent(true);
        } else {
          const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
          if (error) throw error;
          // Refresh the router to pick up the new session via middleware
          router.push('/');
          router.refresh();
        }
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
        <CardContent className="pt-10 pb-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#c8e6cd] text-[#1ea64a] flex items-center justify-center mx-auto mb-4">
            <Check size={24} strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-black">Account Created</h3>
          <p className="text-sm font-light text-black/70 mt-2">
            Please check your email to confirm your account, then sign in.
          </p>
          <Button
            onClick={() => { setSignupSuccess(false); setMode('email-password'); }}
            variant="primary"
            className="mt-6 w-full"
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <span className="caption-text text-black/60 font-mono mb-1 block">AUTHENTICATION</span>
        <CardTitle className="text-2xl font-normal tracking-tight text-black">
          {mode === 'sign-up' ? 'Create Account' : mode === 'otp' ? 'Sign In with OTP' : 'Sign In to ProHomeX'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[#efd4d4] text-black p-3.5 rounded-[8px] text-xs border border-red-200">
              {error}
            </div>
          )}

          {mode === 'sign-up' && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-black/70 mb-1.5">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e6e6e6] rounded-[8px] text-sm text-black focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-black/70 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              disabled={mode === 'otp' && otpSent}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e6e6e6] rounded-[8px] text-sm text-black focus:ring-2 focus:ring-black focus:border-black outline-none disabled:bg-[#f7f7f5] transition-all"
            />
          </div>

          {(mode === 'email-password' || mode === 'sign-up') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-black/70">Password</label>
                {mode === 'email-password' && (
                  <Link href="/reset-password" className="text-xs font-medium text-black hover:opacity-60 transition-opacity">
                    Forgot?
                  </Link>
                )}
              </div>
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e6e6e6] rounded-[8px] text-sm text-black focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
              />
            </div>
          )}

          {mode === 'otp' && otpSent && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-black/70 mb-1.5">Verification Code (OTP)</label>
              <input
                type="text"
                name="token"
                required
                placeholder="Enter 6-digit code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#e6e6e6] rounded-[8px] text-sm text-black focus:ring-2 focus:ring-black focus:border-black outline-none tracking-widest text-center"
              />
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
            {mode === 'sign-up' ? 'Create Account' : mode === 'otp' ? (otpSent ? 'Verify & Login' : 'Send One-Time Code') : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#f1f1f1] flex flex-col items-center gap-2.5 text-xs">
          {mode !== 'email-password' && (
            <button type="button" onClick={() => { setMode('email-password'); setOtpSent(false); setError(null); }} className="font-medium text-black hover:opacity-60 transition-opacity">
              Sign in with password
            </button>
          )}
          {mode !== 'otp' && (
            <button type="button" onClick={() => { setMode('otp'); setError(null); }} className="font-medium text-black hover:opacity-60 transition-opacity">
              Sign in with Email OTP
            </button>
          )}
          {mode !== 'sign-up' && (
            <button type="button" onClick={() => { setMode('sign-up'); setOtpSent(false); setError(null); }} className="text-black/60 hover:text-black transition-colors">
              Don&apos;t have an account? <span className="font-semibold text-black underline underline-offset-2">Sign up</span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

