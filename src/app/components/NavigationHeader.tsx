"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { api } from "../../lib/axios";

// Standard integrated SVG vectors for uncompromised runtime reliability
const ShieldIcon = () => (
  <svg className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <text x="12" y="14" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold" strokeWidth="0">TC</text>
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const PawIcon = () => (
  <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c-1.66 0-3 1.34-3 3 0 2 1 3 3 3s3-1 3-3c0-1.66-1.34-3-3-3zm-4.5-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm9 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-11-4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm13 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const ClinicIcon = () => (
  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
    <line x1="12" y1="14" x2="12" y2="18"></line>
    <line x1="10" y1="16" x2="14" y2="16"></line>
  </svg>
);

export default function NavigationHeader() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ owners: any[]; pets: any[]; microchips: any[] }>({
    owners: [],
    pets: [],
    microchips: []
  });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ owners: [], pets: [], microchips: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
        setIsOpen(true);
      } catch (err) {
        console.error("Global search preview failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Early return AFTER all hooks to comply with React's rules of hooks
  if (pathname === "/login" || pathname === "/register") return null;

  const totalHits = results.owners.length + results.pets.length + results.microchips.length;

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-[1720px] mx-auto px-6 h-20 flex items-center justify-between gap-8">
        
        {/* Brand Showcase */}
        <a href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/50 group-hover:border-orange-500/50 transition-all duration-300 shadow-inner">
            <ShieldIcon />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                TITAN CORE
              </span>
              <span className="text-xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-bold border border-orange-500/20">
                PET
              </span>
            </div>
            <p className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
              Digital Passport Systems
            </p>
          </div>
        </a>

        {/* Cinematic Live Search Center */}
        <div ref={searchRef} className="relative flex-1 max-w-xl">
          <div className="relative flex items-center">
            <div className="absolute left-4 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setIsOpen(true)}
              placeholder="Search platform by owner name, pet, ID, or microchip..."
              className="w-full pl-11 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-full text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 shadow-inner"
            />
            {loading && (
              <div className="absolute right-4 w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>

          {/* Floating Search Output Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-800/60 max-h-[420px] overflow-y-auto">
              <div className="px-4 py-2 bg-slate-950/60 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Unified Cloud Search Results</span>
                <span className="text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">{totalHits} Found</span>
              </div>

              {totalHits === 0 && !loading && (
                <div className="p-6 text-center text-sm text-slate-500">
                  No matching registered entities discovered for &quot;{query}&quot;
                </div>
              )}

              {/* Owner Segment */}
              {results.owners.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
                    <UserIcon />
                    <span>Owners & Guardians</span>
                  </div>
                  {results.owners.map((owner) => (
                    <a
                      key={owner.id}
                      href={`/owners?id=${owner.id}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/50 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-200">{owner.fullName}</div>
                        <div className="text-xs text-slate-400">{owner.email} • {owner.mobile || "No Mobile"}</div>
                      </div>
                      <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Profile →</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Pets Segment */}
              {results.pets.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
                    <PawIcon />
                    <span>Pet Registries</span>
                  </div>
                  {results.pets.map((pet) => (
                    <a
                      key={pet.id}
                      href={`/passport?petId=${pet.id}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/50 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                          {pet.name}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                            {pet.species} / {pet.breed || "Mixed"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Owner: {pet.owner?.fullName || "Unknown"}
                        </div>
                      </div>
                      <span className="text-xs text-orange-400 uppercase tracking-widest font-mono">Passport →</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Microchips Segment */}
              {results.microchips.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <ClinicIcon />
                    <span>Microchip Signatures</span>
                  </div>
                  {results.microchips.map((chip) => (
                    <a
                      key={chip.id}
                      href={`/passport?petId=${chip.pet?.id}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/50 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-mono font-bold text-slate-200">
                          {chip.microchipNo}
                        </div>
                        <div className="text-xs text-slate-400">
                          Implanted: {chip.pet?.name || "Attached Pet"} ({chip.vetClinicName || "Standard Standard"})
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400 uppercase tracking-widest font-mono">Verify →</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Hub Navigation Triggers */}
        <nav className="flex items-center gap-1.5">
          <a
            href="/"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-200"
          >
            Dashboard
          </a>
          <a
            href="/passport"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-200 flex items-center gap-1.5"
          >
            <PawIcon />
            <span>Digital Passport</span>
          </a>
          <a
            href="/owners"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-200 flex items-center gap-1.5"
          >
            <UserIcon />
            <span>Guardian Portal</span>
          </a>
          <a
            href="/clinics"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all duration-200 flex items-center gap-1.5"
          >
            <ClinicIcon />
            <span>Clinics</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
