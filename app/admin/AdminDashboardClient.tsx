'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminView from '@/src/views/AdminView';
import { useAppContext } from '@/src/providers';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

function AdminContent() {
  const router = useRouter();
  const { currentUser, allRequests, loadRequests, appReady } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!appReady || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = Boolean(
    (currentUser && (currentUser.isAdmin || (currentUser as any).role === 'admin')) ||
    (typeof window !== 'undefined' && Boolean(localStorage.getItem('donatelife_admin_token')))
  );

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight mb-2">Access Restricted</h1>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          Direct access to the administrative panel requires authorization. Non-admin users are strictly prohibited.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/admin-login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Admin Sign In</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminView
      currentUser={currentUser}
      allRequests={allRequests}
      onRefreshRequests={loadRequests}
    />
  );
}

export default function AdminDashboardClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}
