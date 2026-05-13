"use client";

import React, { useState, useEffect, Suspense } from "react";
import { api } from "../../lib/axios";

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Check if session key already exists
  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem("titan_core_active_owner_email") : null;
    if (cached) {
      window.location.href = "/owners";
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/owners/login", { email: email.trim(), password });
      if (typeof window !== "undefined") {
        localStorage.setItem("titan_core_active_owner_email", res.data.email);
        window.location.href = "/owners";
      }
    } catch (err: any) {
      console.error("Login authorization request rejected:", err);
      setErrorMsg(err.response?.data?.error || "Account identity key matching this signature not discovered.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">

      {/* Absolute Premium Unsplash Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/krista-mangulsone-9gz3wfHr65U-unsplash.jpg"
          alt="Premium Pet Access Gateway Background"
          className="w-full h-full object-cover filter brightness-[0.45] scale-105 animate-pulse-slow"
        />
        {/* Deep cinematic overlays ensuring perfect form readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40"></div>
        <div className="absolute inset-0 bg-sky-950/10 mix-blend-overlay"></div>
      </div>

      {/* Floating Glassmorphic Authentication Platform */}
      <div className="relative z-10 max-w-md w-full mx-4 my-12 bg-slate-900/85 backdrop-blur-2xl border border-slate-700/60 rounded-3xl p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.75)] overflow-hidden animate-fade-in">

        {/* Glow Element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-500/10 border border-sky-400/30 text-sky-400 mb-4 shadow-inner">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Guardian Sign-In</h1>
          <div className="w-12 h-1 bg-sky-500 mx-auto mt-2 rounded-full"></div>
          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            Access your synchronized portal of digital pet passports and real-time medical updates.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs animate-fade-in text-center font-semibold backdrop-blur-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative">
          <div>
            <label className="block text-[11px] font-extrabold text-sky-400 uppercase mb-2 tracking-wider">
              Account Email *
            </label>
            <input
              type="email"
              required
              placeholder="guardian@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all shadow-inner font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-sky-400 uppercase mb-2 tracking-wider">
              Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all shadow-inner font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs tracking-widest uppercase transition-all shadow-xl shadow-sky-500/20 active:scale-[0.99]"
          >
            {loading ? "Authorizing Signature Payload..." : "Enter Secure Workspace"}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>Unregistered Guardian Identity? </span>
          <a href="/register" className="text-sky-400 hover:text-sky-300 hover:underline font-extrabold ml-1 block mt-1 sm:inline sm:mt-0 transition-colors">
            Create Account →
          </a>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading gateway structure...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
