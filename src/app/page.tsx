"use client";

import React, { useState, useEffect } from "react";
import { api } from "../lib/axios";

// Integrated pure SVG components for complete zero-dependency fidelity
const PawIconLg = () => (
  <svg className="w-10 h-10 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c-1.66 0-3 1.34-3 3 0 2 1 3 3 3s3-1 3-3c0-1.66-1.34-3-3-3zm-4.5-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm9 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-11-4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm13 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
  </svg>
);

const UserCheckIcon = () => (
  <svg className="w-10 h-10 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <polyline points="17 11 19 13 23 9"></polyline>
  </svg>
);

const PassportIcon = () => (
  <svg className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="12 4 12 20"></polyline>
    <circle cx="8" cy="12" r="2"></circle>
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4 ml-1.5 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default function DashboardPage() {
  const [activeOwner, setActiveOwner] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedEmail = typeof window !== "undefined" ? localStorage.getItem("titan_core_active_owner_email") : null;
    if (!cachedEmail) {
      // First workflow gate: if not authorized session token, immediately navigate to /login
      window.location.href = "/login";
      return;
    }

    // Hydrate owner context profile data securely
    async function loadOwnerSession() {
      try {
        const res = await api.post("/owners/login", { email: cachedEmail });
        setActiveOwner(res.data);
      } catch (err) {
        console.error("Session matching validation failed, clearing space:", err);
        if (typeof window !== "undefined") localStorage.removeItem("titan_core_active_owner_email");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }

    loadOwnerSession();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-24 text-slate-500 font-mono text-xs animate-pulse">
        Mounting Synchronized Guardian Workspace System...
      </div>
    );
  }

  if (!activeOwner) return null;

  const totalPetsCount = activeOwner.pets?.length || 0;
  const totalVaccinationsCount = activeOwner.pets?.reduce((acc: number, p: any) => acc + (p.vaccinations?.length || 0), 0) || 0;

  return (
    <div className="relative w-full py-10 px-6 max-w-[1720px] mx-auto flex-1 flex flex-col gap-10 animate-fade-in overflow-x-hidden">
      
      {/* Premium Cinematic Hero Welcome */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 p-8 lg:p-12 border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 mb-4 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Private Guardian Security Partition Active</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-3 leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">{activeOwner.fullName}</span>
          </h1>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Your centralized master space is active. Access your detailed identity markers, bind newly acquired domestic companion passports, and track live clinical travel updates below.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300 font-mono">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Signature:</span>
              <span>{activeOwner.email}</span>
            </div>
            {activeOwner.mobile && (
              <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300 font-mono">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Contact:</span>
                <span>{activeOwner.mobile}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CORE WORKFLOW DESTINATION GATEWAYS: USER OBJECTIVES MAPPING */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Consolidated Management Actions
          </h2>
          <p className="text-xs text-slate-500">Navigate customized execution processes mapping owner, pets, and passport attributes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Action 1: Owner Detail Page Management */}
          <a
            href="/owners"
            className="group relative bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all transform group-hover:scale-110">
              <UserCheckIcon />
            </div>

            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                👤
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                  Owner Detail & Proxy Engine
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Modify baseline home parameters, passport/NIC records, physical locations, and custom emergency contact proxies.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-sky-400">
              <span>Manage Credentials Matrix</span>
              <ArrowRightIcon />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </a>

          {/* Action 2: Pets Management Process */}
          <a
            href="/owners"
            className="group relative bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all transform group-hover:scale-110">
              <PawIconLg />
            </div>

            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                🐾
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                  <span>Pets Management Suite</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                    {totalPetsCount} Registered
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Intake newly attached domestic companion animals, modify biological attributes, and issue serial identification tracking links.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-orange-400">
              <span>Process Roster Configurations</span>
              <ArrowRightIcon />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </a>

          {/* Action 3: Passport Details Management Process */}
          <a
            href="/passport"
            className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all transform group-hover:scale-110">
              <PassportIcon />
            </div>

            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                📖
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span>Passport Details Process</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {totalVaccinationsCount} Logs
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Access digital passport booklets, update certified vaccination timelines, register batch parameters, and view official verification tags.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Enter Passport Booklet Console</span>
              <ArrowRightIcon />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </a>

        </div>
      </div>

      {/* QUICK PREVIEW DIRECTORY: ACTIVE ATTACHED PETS ROSTER */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Companion Array Overview
            </h3>
            <p className="text-xs text-slate-500">Live summary of linked database sub-resources</p>
          </div>
          <a href="/owners" className="text-xs font-bold text-sky-400 hover:underline">
            + Register Attached Entity
          </a>
        </div>

        {!activeOwner.pets || activeOwner.pets.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 italic">
            No active companions configured under this session token yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOwner.pets.map((pet: any) => (
              <div
                key={pet.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between gap-3 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-100 truncate">{pet.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 uppercase tracking-widest font-mono">
                      {pet.species}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 truncate">
                    {pet.breed || "Hybrid"} • {pet.gender || "Unassigned"}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">
                    Vaccines: <strong className="text-orange-400">{pet.vaccinations?.length || 0}</strong>
                  </span>
                  <a
                    href={`/passport?petId=${pet.id}`}
                    className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-0.5"
                  >
                    <span>Open Passport Booklet</span>
                    <ArrowRightIcon />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
