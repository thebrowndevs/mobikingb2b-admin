"use client";

import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    initializeAuth();
    setTimeout(() => {
      const storedAccess = useAuthStore.getState().accessToken;
      const storedRefresh = useAuthStore.getState().refreshToken;

      if (storedAccess && storedRefresh) {
        router.replace("/admin");
      } else {
        setCheckingAuth(false);
      }
    }, 0);
  }, [initializeAuth, router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm text-slate-400 font-medium tracking-wide">Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left side: Premium B2B Brand Showcase (Hidden on Mobile) */}
      <div className="relative hidden lg:flex lg:col-span-7 flex-col justify-between p-12 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-950/40 blur-[120px] pointer-events-none" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />

        {/* Logo and Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 shadow-inner">
            <Image
              src="/logo1.png"
              height={40}
              width={40}
              alt="Mobiking Logo"
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            Mobiking B2B
          </span>
        </motion.div>

        {/* Hero Pitch section */}
        <div className="relative z-10 my-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/25 backdrop-blur-md mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Exclusive Admin Workspace
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight lg:text-5xl bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Manage your B2B operations with ease.
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              Access the administrator panel to manage stock, analyze transactions, coordinate dealers, and process orders in real time.
            </p>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-900"
          >
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">10K+</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Active Retailers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">99.9%</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Fulfillment Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">&lt;24 Hrs</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Average Dispatch</p>
            </div>
          </motion.div>
        </div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative z-10 text-xs text-slate-500"
        >
          &copy; {new Date().getFullYear()} Mobiking India. All rights reserved.
        </motion.p>
      </div>

      {/* Right side: Login Form Workspace */}
      <div className="relative col-span-1 lg:col-span-5 flex flex-col justify-center bg-slate-900/50 lg:bg-slate-950 p-6 md:p-12 lg:border-l lg:border-slate-900">
        {/* Mobiking logo for mobile view only */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <Image
            src="/logo1.png"
            height={32}
            width={32}
            alt="Mobiking Logo"
          />
          <span className="text-lg font-bold text-white">Mobiking</span>
        </div>

        {/* Floating gradient glow behind card for premium feel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto w-full max-w-sm z-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
