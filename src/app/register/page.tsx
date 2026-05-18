"use client";

import React, { useState, useEffect, Suspense } from "react";
import { api } from "../../lib/axios";

function RegisterPageContent() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobile: "",
    passportNic: "",
    address: "",
    country: "",
    emergencyContactName: "",
    emergencyContactPhone: ""
  });

  // Verify unallocated login profile states
  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem("titan_core_active_owner_email") : null;
    if (cached) {
      window.location.href = "/owners";
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.password) {
      setErrorMsg("Please specify a strong authentication access token (password).");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/owners", formData);
      if (typeof window !== "undefined") {
        localStorage.setItem("titan_core_active_owner_email", res.data.email);
        window.location.href = "/owners";
      }
    } catch (err: any) {
      console.error("Account structure rejection constraint:", err);
      setErrorMsg(err.response?.data?.error || "Registration validation error. Email signature may exist.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden py-12">

      {/* Absolute Premium Unsplash Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/lydia-torrey-AovflqCt9Ws-unsplash.jpg"
          alt="Ambient Multi-Pet Base Registry Background"
          className="w-full h-full object-cover filter brightness-[0.40] scale-105 animate-pulse-slow"
        />
        {/* Cinematic blend overlay ensuring perfect input focus */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/50"></div>
        <div className="absolute inset-0 bg-emerald-950/10 mix-blend-overlay"></div>
      </div>

      {/* Floating Glassmorphic Registration Roster Card */}
      <div className="relative z-10 max-w-2xl w-full mx-4 bg-slate-900/85 backdrop-blur-2xl border border-slate-700/60 rounded-3xl p-8 md:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in">

        {/* Glow Elements */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-400/30 text-emerald-400 mb-4 shadow-inner">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="17" y1="11" x2="23" y2="11"></line>
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Register Guardian Workspace</h1>
          <div className="w-12 h-1 bg-emerald-500 mx-auto mt-2 rounded-full"></div>
          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            Initialize your direct account signature.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs animate-fade-in text-center font-semibold backdrop-blur-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs relative">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-2 tracking-wider">Full Name *</label>
            <input
              type="text"
              required
              placeholder="Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-2 tracking-wider">Email Address *</label>
            <input
              type="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-2 tracking-wider">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-2 tracking-wider">Mobile  Contact</label>
            <input
              type="text"
              placeholder="+1 (555) 019-2834"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-2 tracking-wider">Passport / Verified NIC</label>
            <input
              type="text"
              placeholder="P-992184"
              value={formData.passportNic}
              onChange={(e) => setFormData({ ...formData, passportNic: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-2 tracking-wider">Country Signature</label>
            <input
              type="text"
              placeholder="United States"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-2 tracking-wider">Primary Address</label>
            <input
              type="text"
              placeholder="742 Evergreen Terrace"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase mb-2 tracking-wider">Emergency Contact Name</label>
            <input
              type="text"
              placeholder="Emergency Contact Name"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              className="w-full px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all font-medium"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs tracking-widest uppercase transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.99]"
            >
              {loading ? "Loading..." : " Confirm Identity "}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400 relative">
          <span>Already have an account? </span>
          <a href="/login" className="text-emerald-400 hover:text-emerald-300 hover:underline font-extrabold ml-1 block mt-1 sm:inline sm:mt-0 transition-colors">
            login →
          </a>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
