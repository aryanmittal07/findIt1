'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass, Lock, Mail, AlertCircle, ArrowRight, Loader2, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
      setLoading(false);
    } else {
      router.push(redirectUrl);
    }
  };

  const handleFillCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span className="font-serif font-black text-3xl tracking-tight text-[#193227]">
            Find<span className="text-[#396950]">It</span>
          </span>
          <h1 className="text-xl font-bold tracking-tight text-[#193227]">
            Sign in to the Noticeboard
          </h1>
          <p className="text-xs text-[#55695e]">
            Access your reports, potential matches, and safe in-app messages.
          </p>
        </div>

        {/* Demo Credentials Reference Box */}
        <div className="p-4 bg-[#e2eee5]/80 border border-[#c5dcce] rounded-2xl space-y-2 text-xs">
          <p className="font-semibold text-[#193227] flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#32634c]" />
            Registered Accounts (Click to fill email)
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleFillCredentials('aryan@example.com')}
              className="px-3 py-2 bg-white hover:bg-[#fbf8f3] border border-[#c5dcce] text-[#193227] rounded-xl font-medium text-left transition-colors shadow-2xs"
            >
              <span className="block font-bold text-[#193227]">Aryan (Student)</span>
              <span className="text-[10px] text-[#6c8074]">Pass: UserPass123!</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('admin@findit.org')}
              className="px-3 py-2 bg-white hover:bg-[#fbf8f3] border border-[#faedd9] text-[#894323] rounded-xl font-medium text-left transition-colors shadow-2xs"
            >
              <span className="block font-bold text-[#894323]">Campus Staff (Admin)</span>
              <span className="text-[10px] text-[#894323]/80">Pass: AdminPass123!</span>
            </button>
          </div>
          <p className="text-[10px] text-[#55695e] pt-1 italic">
            * Password is encrypted with bcrypt and verified securely on the server.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-800">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-[#193227] hover:bg-[#254536] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don’t have an account yet?{' '}
          <Link
            href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
