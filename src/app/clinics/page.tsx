"use client";

import React, { useState, useEffect } from "react";
import { api } from "../../lib/axios";

const PlusCircleIcon = () => (
  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

const VerifiedBadgeIcon = () => (
  <svg className="w-4 h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
  </svg>
);

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    clinicName: "",
    veterinarianName: "",
    licenseNo: "",
    contactNumber: "",
    address: ""
  });

  useEffect(() => {
    fetchClinics();
  }, []);

  async function fetchClinics() {
    setLoading(true);
    try {
      // Backend routes mount standalone /api/clinics mapping
      const res = await api.get("/clinics");
      setClinics(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed fetching certified clinic registries:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClinic(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setFormLoading(true);

    try {
      const res = await api.post("/clinics", formData);
      setClinics([res.data, ...clinics]);
      setSuccessMsg("Veterinary Clinic successfully registered and certified under global array keys.");
      
      setFormData({
        clinicName: "",
        veterinarianName: "",
        licenseNo: "",
        contactNumber: "",
        address: ""
      });

      setTimeout(() => {
        setShowForm(false);
        setSuccessMsg("");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Payload submission failed. Ensure clinicName and veterinarianName strings are provided.");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto py-10 px-6 flex-1 flex flex-col gap-8">
      
      {/* Title Showcase Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
            Certified Facilities Management
          </div>
          <h1 className="text-2xl font-black text-white">Accredited Veterinary Clinic Networks</h1>
          <p className="text-xs text-slate-400 mt-1">
            Register certified diagnostic stations, track practicing veterinarian validation keys, and log physical stamp seals.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all duration-200 flex items-center shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
        >
          <PlusCircleIcon />
          <span>{showForm ? "Hide Intake Panel" : "Accredit New Facility"}</span>
        </button>
      </div>

      {/* Facility Accreditation Intake Form Dropdown */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl animate-fade-in">
          <h2 className="text-base font-bold text-white mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Clinical Hub Verification Parameters</span>
            <span className="text-[10px] text-slate-500 font-mono">DB Target Schema: VeterinaryClinic</span>
          </h2>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleCreateClinic} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Registered Clinic Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Blue Cross Animal Care"
                value={formData.clinicName}
                onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Lead Veterinarian *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Robert Vance"
                value={formData.veterinarianName}
                onChange={(e) => setFormData({ ...formData, veterinarianName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Practicing License No</label>
              <input
                type="text"
                placeholder="VET-LIC-44119"
                value={formData.licenseNo}
                onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Contact Line</label>
              <input
                type="text"
                placeholder="+1 (555) 441-2800"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Station Headquarters Address</label>
              <input
                type="text"
                placeholder="400 West Central Diagnostic Blvd, Suite A"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex items-end justify-end pt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs transition-all shadow-md"
              >
                {formLoading ? "Certifying Hub..." : "Accredit & Commit Center"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Certified Hub Grid Matrix */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Operational Clinical Roster
          </h2>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
            ISO Compliant Stamp Arrays
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 bg-slate-900 rounded-2xl animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : clinics.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No certified clinical center hubs persisted in runtime registries. Use the accreditation button above to start logging.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>

                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-100 font-extrabold text-base group-hover:text-emerald-400 transition-colors">
                        <VerifiedBadgeIcon />
                        <span className="truncate">{clinic.clinicName}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-medium">
                        {clinic.veterinarianName}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {clinic.licenseNo || "CERTIFIED"}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                    <div className="flex justify-between text-slate-400">
                      <span>Line:</span>
                      <span className="font-mono text-slate-300">{clinic.contactNumber || "Unlisted"}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Station:</span>
                      <span className="text-slate-300 truncate max-w-[180px]">{clinic.address || "Standard Parkway"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>ID: {clinic.id.split("-")[0]}</span>
                  <span className="text-emerald-500/80 uppercase font-bold tracking-wider text-[9px]">
                    ● Certified Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
