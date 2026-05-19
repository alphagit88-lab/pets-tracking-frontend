"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/axios";

// Standard standalone vectors ensuring flawless execution
const StampIcon = () => (
  <svg className="w-10 h-10 text-orange-500/40 transform -rotate-12" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="5,3" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
    <text x="50" y="45" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold">OFFICIAL</text>
    <text x="50" y="58" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="extrabold">VERIFIED</text>
    <text x="50" y="70" textAnchor="middle" fill="currentColor" fontSize="6" letterSpacing="2">TITAN CORE</text>
  </svg>
);

const MicrochipStickerIcon = () => (
  <svg className="w-full h-24 text-slate-700" viewBox="0 0 200 60" fill="none">
    <rect x="5" y="5" width="190" height="50" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" strokeDasharray="4 2"/>
    <path d="M20 20h160v4H20zM20 28h160v2H20zM20 34h120v2H20zM20 40h140v2H20z" fill="#475569"/>
    <text x="100" y="50" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">||| | |||| || ||||| ||| ||</text>
  </svg>
);

function PassportBookletContent() {
  const searchParams = useSearchParams();
  const initialPetId = searchParams.get("petId");
  
  const [petList, setPetList] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cover" | "microchip" | "vaccines" | "medical">("cover");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCloseDropdown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleCloseDropdown);
    return () => document.removeEventListener("mousedown", handleCloseDropdown);
  }, []);

  // Hydrate cached data on client mount only (avoids SSR/client mismatch)
  useEffect(() => {
    try {
      const cachedPetList = localStorage.getItem("titan_core_cached_pet_list");
      const cachedActivePet = localStorage.getItem("titan_core_cached_active_pet");
      const cachedVaccinations = localStorage.getItem("titan_core_cached_vaccinations");
      if (cachedPetList) setPetList(JSON.parse(cachedPetList));
      if (cachedActivePet) setSelectedPet(JSON.parse(cachedActivePet));
      if (cachedVaccinations) setVaccinations(JSON.parse(cachedVaccinations));
    } catch (e) {
      // Ignore corrupt cache
    }
  }, []);

  useEffect(() => {
    if (selectedPet) {
      localStorage.setItem("titan_core_cached_active_pet", JSON.stringify(selectedPet));
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.get("petId") !== selectedPet.id) {
          url.searchParams.set("petId", selectedPet.id);
          window.history.replaceState(null, "", url.toString());
        }
      }
    }
  }, [selectedPet]);

  // Dynamic live clinical registry states
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [showVacForm, setShowVacForm] = useState(false);
  const [editingVacId, setEditingVacId] = useState<string | null>(null);
  const [vacFormLoading, setVacFormLoading] = useState(false);
  const [vacFormData, setVacFormData] = useState({
    vaccineCategory: "Rabies",
    vaccineName: "",
    batchNo: "",
    dateGiven: new Date().toISOString().split("T")[0],
    validUntilNextDue: "",
    vetId: ""
  });

  // Microchip Section form states
  const [microchipFormData, setMicrochipFormData] = useState({
    microchipNo: "",
    isoStandard: "11784/11785",
    implantDate: "",
    implantLocation: "Neck/Shoulder",
    vetClinicName: "",
    stickerUrl: ""
  });
  const [microchipSaving, setMicrochipSaving] = useState(false);

  // Veterinary Details form states
  const [clinicFormData, setClinicFormData] = useState({
    clinicName: "",
    veterinarianName: "",
    licenseNo: "",
    address: "",
    contact: "",
    sealUrl: ""
  });
  const [clinicSaving, setClinicSaving] = useState(false);

  // Fetch complete pet roster to populate fast side selector navigation
  useEffect(() => {
    async function loadPets() {
      try {
        let fetchedPets: any[] = [];
        let specificPet: any = null;

        const cachedEmail = typeof window !== "undefined" ? localStorage.getItem("titan_core_active_owner_email") : null;

        // 1. Fetch direct target pet, owner session restore, and clinics list concurrently (Turbo Performance!)
        const [petRes, restoreRes, clinRes] = await Promise.all([
          initialPetId ? api.get(`/pets/${initialPetId}`).catch(() => null) : null,
          cachedEmail ? api.post("/owners/restore", { email: cachedEmail }).catch(() => null) : null,
          api.get("/clinics").catch(() => null)
        ]);

        if (petRes?.data) {
          specificPet = petRes.data;
        }

        if (clinRes?.data) {
          setClinics(clinRes.data || []);
        }

        // 2. Fetch owner's pets if restore succeeded
        if (restoreRes?.data?.id) {
          try {
            const res = await api.get(`/owners/${restoreRes.data.id}/pets`);
            fetchedPets = res.data || [];
          } catch (sessionErr) {
            console.error("Failed fetching owner pets:", sessionErr);
          }
        }

        // 3. Fallback: If pet list is still empty, fetch globally
        if (fetchedPets.length === 0) {
          try {
            const searchRes = await api.get("/search?q=");
            fetchedPets = searchRes.data?.pets || [];
          } catch (searchErr) {
            console.error("Fallback search failed:", searchErr);
          }
        }

        // 4. Merge specificPet into the petList if it is not already present
        if (specificPet) {
          const exists = fetchedPets.some((p: any) => p.id === specificPet.id);
          if (!exists) {
            fetchedPets = [specificPet, ...fetchedPets];
          }
        }

        setPetList(fetchedPets);
        localStorage.setItem("titan_core_cached_pet_list", JSON.stringify(fetchedPets));

        // 5. Select active pet: specificPet (Param ID) -> First Pet in List -> Null
        let activePetToSet = null;
        if (specificPet) {
          activePetToSet = specificPet;
        } else if (fetchedPets.length > 0) {
          activePetToSet = fetchedPets[0];
        }

        setSelectedPet(activePetToSet);
        if (activePetToSet) {
          localStorage.setItem("titan_core_cached_active_pet", JSON.stringify(activePetToSet));
        } else {
          localStorage.removeItem("titan_core_cached_active_pet");
        }
      } catch (err) {
        console.error("Failed loading passport registries:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPets();
  }, [initialPetId]);

  useEffect(() => {
    if (selectedPet?.id) {
      loadVaccinations(selectedPet.id);

      // Hydrate microchip form data
      const mc = selectedPet.microchipRecord || {};
      setMicrochipFormData({
        microchipNo: mc.microchipNo || "",
        isoStandard: mc.isoStandard || "11784/11785",
        implantDate: mc.implantDate ? mc.implantDate.split("T")[0] : "",
        implantLocation: mc.implantLocation || "Neck/Shoulder",
        vetClinicName: mc.vetClinicName || "",
        stickerUrl: mc.stickerUrl || mc.stickerImage || ""
      });

      // Hydrate clinic form data from first matching clinic or existing record
      const matchClinic = clinics.find(c => c.clinicName === mc.vetClinicName) || clinics[0] || {};
      setClinicFormData({
        clinicName: mc.vetClinicName || matchClinic.clinicName || "",
        veterinarianName: matchClinic.veterinarianName || "",
        licenseNo: matchClinic.licenseNo || "",
        address: matchClinic.address || "",
        contact: matchClinic.contact || "",
        sealUrl: matchClinic.sealUrl || matchClinic.sealImage || ""
      });
    }
  }, [selectedPet, clinics]);

  async function loadVaccinations(petId: string) {
    try {
      const res = await api.get(`/pets/${petId}/vaccinations`);
      setVaccinations(res.data || []);
      localStorage.setItem("titan_core_cached_vaccinations", JSON.stringify(res.data || []));
    } catch (err) {
      console.error("Failed fetching live pet vaccinations:", err);
    }
  }

  function startEditVac(vac: any) {
    setEditingVacId(vac.id);
    setVacFormData({
      vaccineCategory: vac.vaccineCategory || "Rabies",
      vaccineName: vac.vaccineName || "",
      batchNo: vac.batchNo || "",
      dateGiven: vac.dateGiven ? vac.dateGiven.split("T")[0] : new Date().toISOString().split("T")[0],
      validUntilNextDue: vac.validUntilNextDue ? vac.validUntilNextDue.split("T")[0] : "",
      vetId: vac.vetId || ""
    });
    setShowVacForm(true);
  }

  function startAddVac() {
    setEditingVacId(null);
    setVacFormData({
      vaccineCategory: "Rabies",
      vaccineName: "",
      batchNo: "",
      dateGiven: new Date().toISOString().split("T")[0],
      validUntilNextDue: "",
      vetId: clinics.length > 0 ? clinics[0].id : ""
    });
    setShowVacForm(true);
  }

  async function handleSaveVaccination(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPet) return;
    setVacFormLoading(true);
    try {
      const payload = {
        ...vacFormData,
        validUntilNextDue: vacFormData.validUntilNextDue || undefined,
        vetId: vacFormData.vetId || undefined
      };

      if (editingVacId) {
        await api.put(`/vaccinations/${editingVacId}`, payload);
      } else {
        await api.post(`/pets/${selectedPet.id}/vaccinations`, payload);
      }

      await loadVaccinations(selectedPet.id);
      setShowVacForm(false);
      setEditingVacId(null);
    } catch (err) {
      console.error("Failed persisting vaccination record:", err);
      alert("Failed saving vaccination schedule. Verify input configuration.");
    } finally {
      setVacFormLoading(false);
    }
  }

  async function handleDeleteVaccination(vacId: string) {
    if (!confirm("Remove this accredited vaccination stamp block permanently?")) return;
    try {
      await api.delete(`/vaccinations/${vacId}`);
      if (selectedPet?.id) await loadVaccinations(selectedPet.id);
    } catch (err) {
      console.error("Failed deleting vaccination log:", err);
      alert("Failed deleting clinical entry.");
    }
  }

  const [uploadingSticker, setUploadingSticker] = useState(false);
  const [uploadingSeal, setUploadingSeal] = useState(false);

  // File encodings for visual dropzones
  async function handleStickerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSticker(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Sticker upload failed");
      }

      const blob = await response.json();
      setMicrochipFormData(prev => ({ ...prev, stickerUrl: blob.url }));
    } catch (err) {
      console.error("Vercel Blob sticker upload failed:", err);
      alert("Failed to upload barcode image. Please try again.");
    } finally {
      setUploadingSticker(false);
    }
  }

  async function handleSealUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSeal(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Seal upload failed");
      }

      const blob = await response.json();
      setClinicFormData(prev => ({ ...prev, sealUrl: blob.url }));
    } catch (err) {
      console.error("Vercel Blob seal upload failed:", err);
      alert("Failed to upload vet seal image. Please try again.");
    } finally {
      setUploadingSeal(false);
    }
  }

  // Save/Update operations persistence calls
  async function handleSaveMicrochip(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPet?.id) return;
    setMicrochipSaving(true);
    try {
      await api.post(`/pets/${selectedPet.id}/microchip`, {
        ...microchipFormData,
        stickerImage: microchipFormData.stickerUrl
      });
      alert("Microchip verification array successfully committed!");
      
      // Reload target search lists to sync UI state
      const res = await api.get("/search?q=");
      setPetList(res.data?.pets || []);
      const updatedPet = res.data?.pets?.find((p: any) => p.id === selectedPet.id);
      if (updatedPet) setSelectedPet(updatedPet);
    } catch (err: any) {
      console.error("Error saving microchip record:", err);
      alert(err.response?.data?.error || "Failed persisting microchip signature.");
    } finally {
      setMicrochipSaving(false);
    }
  }

  async function handleSaveClinic(e: React.FormEvent) {
    e.preventDefault();
    setClinicSaving(true);
    try {
      // Find matching clinic if editing, or post fresh
      const match = clinics.find(c => c.clinicName === clinicFormData.clinicName);
      const payload = {
        ...clinicFormData,
        sealImage: clinicFormData.sealUrl
      };

      if (match?.id) {
        await api.put(`/clinics/${match.id}`, payload);
      } else {
        await api.post("/clinics", payload);
      }
      alert("Accredited Veterinary Registry details saved successfully!");

      // Refresh global clinics mapping list
      const clinRes = await api.get("/clinics");
      setClinics(clinRes.data || []);
    } catch (err: any) {
      console.error("Error saving clinic parameters:", err);
      alert(err.response?.data?.error || "Failed updating veterinary clinical details.");
    } finally {
      setClinicSaving(false);
    }
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto py-10 px-6 flex-1 flex flex-col gap-6">
      
      {/* Main Content Area: Tabbed Digital Booklet View */}
      <div className="flex-1 flex flex-col gap-6">
        
        {loading && !selectedPet ? (
          <div className="flex-1 flex flex-col gap-6 animate-pulse">
            {/* Skeleton Tab Header */}
            <div className="h-14 bg-slate-900/40 rounded-2xl border border-slate-800/80 flex items-center justify-between px-4">
              <div className="flex gap-2">
                <div className="w-24 h-8 bg-slate-800/60 rounded-xl"></div>
                <div className="w-24 h-8 bg-slate-800/60 rounded-xl"></div>
                <div className="w-24 h-8 bg-slate-800/60 rounded-xl"></div>
              </div>
              <div className="w-32 h-8 bg-slate-800/60 rounded-xl"></div>
            </div>
            {/* Skeleton Booklet Canvas */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl min-h-[700px] grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
              <div className="p-8 flex flex-col justify-between items-center bg-slate-950/40">
                <div className="w-16 h-16 bg-slate-800/60 rounded-2xl"></div>
                <div className="space-y-3 my-10 w-full max-w-xs items-center flex flex-col">
                  <div className="w-32 h-8 bg-slate-800/60 rounded-lg"></div>
                  <div className="w-48 h-6 bg-slate-800/60 rounded-lg"></div>
                </div>
                <div className="w-full max-w-xs h-24 bg-slate-800/60 rounded-2xl"></div>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-slate-800/60 rounded"></div>
                    <div className="w-32 h-6 bg-slate-800/60 rounded"></div>
                  </div>
                  <div className="w-24 h-24 bg-slate-800/60 rounded-2xl"></div>
                </div>
                <div className="space-y-4 pt-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex justify-between border-b border-slate-800 pb-2">
                      <div className="w-20 h-4 bg-slate-800/60 rounded"></div>
                      <div className="w-40 h-4 bg-slate-800/60 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
        {/* Booklet Controls Tab Header */}
        {selectedPet && (
          <div className="relative z-30 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-2 rounded-2xl border border-slate-800 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("cover")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex-1 sm:flex-none text-center ${
                  activeTab === "cover"
                    ? "bg-slate-800 text-orange-400 shadow-inner border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                Cover & Identity
              </button>
              <button
                onClick={() => setActiveTab("microchip")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex-1 sm:flex-none text-center ${
                  activeTab === "microchip"
                    ? "bg-slate-800 text-orange-400 shadow-inner border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                Microchip Signature
              </button>
              <button
                onClick={() => setActiveTab("vaccines")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex-1 sm:flex-none text-center ${
                  activeTab === "vaccines"
                    ? "bg-slate-800 text-orange-400 shadow-inner border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                Vaccination Registry
              </button>
              <button
                onClick={() => setActiveTab("medical")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex-1 sm:flex-none text-center ${
                  activeTab === "medical"
                    ? "bg-slate-800 text-orange-400 shadow-inner border border-slate-700"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                Deworming & Surgery
              </button>
            </div>

            {/* Booklet ID & Active Pet Selector Group */}
            <div className="flex items-center gap-3">
              {/* Booklet ID Pill */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/60 text-slate-400 border border-slate-800/80 text-[10px] font-mono">
                <span>Booklet:</span>
                <span className="text-slate-200 font-bold uppercase">{selectedPet.id.split("-")[0]}</span>
              </div>

              {/* Modern Pet Dropdown Selector */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-xl transition-all duration-200 text-left focus:outline-none"
                >
                  {selectedPet.photoUrl || selectedPet.photoImage ? (
                    <img
                      src={selectedPet.photoUrl || selectedPet.photoImage}
                      alt={selectedPet.name}
                      className="w-4 h-4 rounded object-cover border border-slate-800/80 mr-1.5"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center text-[9px] font-bold text-white uppercase mr-1.5">
                      {selectedPet.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                    <span>{selectedPet.name}</span>
                    <span className="text-[7px] text-slate-500">▼</span>
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-900">
                    <div className="px-3 py-1 bg-slate-900/60 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                      Switch Passport
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                      {petList.map((pet) => {
                        const isSelected = pet.id === selectedPet.id;
                        return (
                          <button
                            key={pet.id}
                            onClick={() => {
                              setSelectedPet(pet);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-all border border-transparent text-left ${
                              isSelected
                                ? "bg-orange-500/10 text-orange-400 font-bold border-orange-500/20"
                                : "hover:bg-slate-900/80 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {pet.photoUrl || pet.photoImage ? (
                              <img
                                src={pet.photoUrl || pet.photoImage}
                                alt={pet.name}
                                className="w-4 h-4 rounded object-cover"
                              />
                            ) : (
                              <div className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${
                                isSelected ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400"
                              }`}>
                                {pet.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] truncate font-bold">{pet.name}</div>
                              <div className="text-[7px] text-slate-500 truncate capitalize">
                                {pet.species} • {pet.breed || "Hybrid"}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* The Physical Booklet Document Canvas */}
        <div className="relative flex-1 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden min-h-[700px] flex flex-col">
          
          {!selectedPet ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-600 mb-4 border border-slate-700/40">
                🪪
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-1">No Booklet Focus Enabled</h3>
              <p className="text-xs text-slate-500 max-w-md">
                Select an active pet registry mapping from the target directory interface on the left to render the corresponding secure international documentation passport structures.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">

              {/* TAB 1: COVER & IDENTIFICATION (PDF Page 1 & 2) */}
              {activeTab === "cover" && (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  
                  {/* Left Side: Stunning Premium PDF Page 1 Cover Replication */}
                  <div className="p-8 lg:p-12 flex flex-col justify-between items-center text-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"></div>
                    <div className="absolute -left-32 -top-32 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="space-y-4 pt-6">
                      <div className="inline-block p-4 bg-slate-900 rounded-2xl border border-orange-500/30 shadow-lg shadow-orange-500/5">
                        <span className="text-3xl font-black text-orange-500 tracking-tighter">TC</span>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">TITAN CORE</div>
                        <div className="text-[9px] uppercase tracking-widest text-orange-500 font-semibold">— PET SERVICES —</div>
                      </div>
                    </div>

                    <div className="my-10 space-y-2">
                      <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                        PET
                      </h1>
                      <h2 className="text-4xl lg:text-5xl font-black text-orange-500 tracking-tight leading-none">
                        PASSPORT
                      </h2>
                      <p className="text-xs text-slate-400 font-medium tracking-wide mt-3 pt-2 border-t border-slate-800 w-48 mx-auto">
                        Digital Pet Travel & Health Record
                      </p>
                    </div>

                    {/* PDF Visual Accent Badge Container */}
                    <div className="w-full max-w-xs bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500 border border-orange-500/20">
                          🛡️
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">One Passport.</div>
                          <div className="text-xs font-bold text-orange-400">Endless Adventures.</div>
                          <div className="text-[9px] text-slate-400">Your pet&apos;s journey, our priority.</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[9px] font-bold text-slate-400">
                        <div className="p-1.5 bg-slate-950 rounded text-center">
                          <span className="block text-white mb-0.5">Verified</span>Records
                        </div>
                        <div className="p-1.5 bg-slate-950 rounded text-center">
                          <span className="block text-orange-400 mb-0.5">Vaccine</span>Tracker
                        </div>
                        <div className="p-1.5 bg-slate-950 rounded text-center">
                          <span className="block text-sky-400 mb-0.5">Travel</span>Ready
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 w-full">
                      <div className="py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/10">
                        Healthy Pet. Happy Journey.
                      </div>
                    </div>

                  </div>

                  {/* Right Side: PDF Page 2 PET & OWNER INFORMATION Form Registry */}
                  <div className="p-8 lg:p-10 flex flex-col justify-between overflow-y-auto max-h-[700px]">
                    
                    <div className="space-y-6">
                      
                      {/* Section Header with PDF Photo Box placeholder */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">
                            Identification Registry
                          </div>
                          <h3 className="text-lg font-extrabold text-white">PET INFORMATION</h3>
                        </div>

                        {/* Pet Photo Box (4cm x 4cm corresponding logic) */}
                        <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden text-center text-slate-500 group relative">
                          {selectedPet.photoUrl || selectedPet.photoImage ? (
                            <img
                              src={selectedPet.photoUrl || selectedPet.photoImage}
                              alt={selectedPet.name}
                              className="w-full h-full object-cover"
                              fetchPriority="high"
                              loading="eager"
                            />
                          ) : (
                            <>
                              <span className="text-xs font-bold text-slate-600">4cm x 4cm</span>
                              <span className="text-[9px] text-slate-600">Photo Box</span>
                              <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-slate-800/40 select-none">
                                {selectedPet.name.charAt(0)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pet Target Fields Table */}
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800">
                          <span className="text-slate-500 font-medium">Pet Name</span>
                          <span className="col-span-2 font-bold text-slate-200">{selectedPet.name}</span>
                        </div>
                        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800">
                          <span className="text-slate-500 font-medium">Species</span>
                          <span className="col-span-2 font-bold text-slate-200">{selectedPet.species}</span>
                        </div>
                        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800">
                          <span className="text-slate-500 font-medium">Breed</span>
                          <span className="col-span-2 font-bold text-slate-200">{selectedPet.breed || "Standard Specie"}</span>
                        </div>
                        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800">
                          <span className="text-slate-500 font-medium">Color / Markings</span>
                          <span className="col-span-2 font-bold text-slate-200">{selectedPet.colorMarkings || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800">
                          <span className="text-slate-500 font-medium">Gender</span>
                          <span className="col-span-2 font-bold text-slate-200">{selectedPet.gender || "Unspecified"}</span>
                        </div>
                        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800">
                          <span className="text-slate-500 font-medium">DOB</span>
                          <span className="col-span-2 font-bold text-slate-200 font-mono">
                            {selectedPet.dob ? new Date(selectedPet.dob).toLocaleDateString() : "//20__"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 py-1.5 border-b border-slate-800">
                          <span className="text-slate-500 font-medium">Sterilized</span>
                          <span className="col-span-2 font-bold text-orange-400">
                            {selectedPet.sterilized ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      {/* Owner Information Section */}
                      <div className="pt-4">
                        <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2">
                          Guardian Information
                        </div>
                        <h3 className="text-sm font-extrabold text-white mb-3">OWNER / GUARDIAN DETAILS</h3>
                        
                        <div className="space-y-2 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                          <div className="grid grid-cols-3 py-1 border-b border-slate-900">
                            <span className="text-slate-500 font-medium">Full Name</span>
                            <span className="col-span-2 font-bold text-slate-200">
                              {selectedPet.owner?.fullName || "Unlinked Owner"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 py-1 border-b border-slate-900">
                            <span className="text-slate-500 font-medium">Passport/NIC</span>
                            <span className="col-span-2 font-bold text-slate-300 font-mono">
                              {selectedPet.owner?.passportNic || "N/A"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 py-1 border-b border-slate-900">
                            <span className="text-slate-500 font-medium">Mobile</span>
                            <span className="col-span-2 font-bold text-slate-300 font-mono">
                              {selectedPet.owner?.mobile || "N/A"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 py-1 border-b border-slate-900">
                            <span className="text-slate-500 font-medium">Email</span>
                            <span className="col-span-2 font-bold text-slate-400 truncate">
                              {selectedPet.owner?.email || "N/A"}
                            </span>
                          </div>
                          
                          <div className="pt-2 mt-2 border-t border-slate-800 text-[11px]">
                            <span className="block text-slate-500 font-bold mb-1 uppercase tracking-wider text-[9px]">
                              Emergency Contact
                            </span>
                            <div className="text-slate-300">
                              Name: <span className="font-semibold text-white">{selectedPet.owner?.emergencyContactName || "__________________"}</span>
                            </div>
                            <div className="text-slate-300">
                              Phone: <span className="font-mono text-white">{selectedPet.owner?.emergencyContactPhone || "__________________"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>TC-AUTH-REG</span>
                      <span>PAGE 01/02</span>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: MICROCHIP & VETERINARY SIGNATURES (PDF Page 3 & 4 Replica) */}
              {activeTab === "microchip" && (
                <div className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[700px] bg-slate-900/40">
                  <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* --- DUAL-PAGE PASSPORT BOOKLET REPLICA (PAGES 3 & 4) --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 border border-slate-800 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-slate-950/90 overflow-hidden shadow-2xl">
                      
                      {/* PAGE 3: MICROCHIP RECORD REPLICA */}
                      <div className="p-6 lg:p-8 flex flex-col justify-between min-h-[420px] relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>
                        <div className="absolute -left-24 -top-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="space-y-6">
                          <div className="text-center pb-3 border-b border-slate-900">
                            <h3 className="text-sm font-extrabold text-white tracking-widest font-sans uppercase">MICROCHIP RECORD</h3>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Official Implant Registration</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            {/* Left: Fields List */}
                            <div className="md:col-span-2 space-y-4 text-[11px] font-mono">
                              <div className="flex justify-between items-end border-b border-slate-900 pb-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Field</span>
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Details</span>
                              </div>
                              
                              <div className="flex justify-between items-end border-b border-slate-900/60 pb-1.5">
                                <span className="text-slate-500 font-medium">Microchip No (15 digits)</span>
                                <span className="font-bold text-emerald-400 text-right truncate pl-2 selection:bg-emerald-500/20">
                                  {microchipFormData.microchipNo || "_______________"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-end border-b border-slate-900/60 pb-1.5">
                                <span className="text-slate-500 font-medium">ISO Standard</span>
                                <span className="font-bold text-slate-200 text-right truncate pl-2">
                                  {microchipFormData.isoStandard || "11784/11785"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-end border-b border-slate-900/60 pb-1.5">
                                <span className="text-slate-500 font-medium">Implant Date</span>
                                <span className="font-bold text-slate-200 text-right shrink-0">
                                  {microchipFormData.implantDate ? new Date(microchipFormData.implantDate).toLocaleDateString() : "//20__"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-end border-b border-slate-900/60 pb-1.5">
                                <span className="text-slate-500 font-medium">Implant Location</span>
                                <span className="font-bold text-slate-200 text-right truncate pl-2">
                                  {microchipFormData.implantLocation || "Neck/Shoulder"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-end border-b border-slate-900/60 pb-1.5">
                                <span className="text-slate-500 font-medium">Vet/Clinic</span>
                                <span className="font-bold text-slate-200 text-right truncate pl-2">
                                  {microchipFormData.vetClinicName || "_______________"}
                                </span>
                              </div>
                            </div>
                            
                            {/* Right: Sticker Box Container */}
                            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between items-center text-center h-[220px] w-full relative overflow-hidden group shadow-inner">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Picture of microchip sticker</span>
                              
                              <div className="my-auto w-full flex items-center justify-center">
                                {microchipFormData.stickerUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={microchipFormData.stickerUrl}
                                    alt="Microchip Barcode Sticker Asset"
                                    className="max-h-28 object-contain rounded-lg border border-slate-800 shadow-md group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="opacity-30 group-hover:opacity-50 transition-opacity">
                                    <MicrochipStickerIcon />
                                  </div>
                                )}
                              </div>
                              <span className="text-[8px] text-slate-600 block mt-2 tracking-wide">Secure Barcode Tag</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 pt-3 border-t border-slate-900 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                          <span>TC-MICRO-REG</span>
                          <span>PAGE 03</span>
                        </div>
                      </div>
                      
                      {/* PAGE 4: REGISTERED VETERINARY DETAILS REPLICA */}
                      <div className="p-6 lg:p-8 flex flex-col justify-between min-h-[420px] relative">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600"></div>
                        <div className="absolute -right-24 -top-24 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="space-y-6">
                          <div className="text-center pb-3 border-b border-slate-900">
                            <h3 className="text-sm font-extrabold text-white tracking-widest font-sans uppercase">REGISTERED VETERINARY DETAILS</h3>
                            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Accredited Medical Personnel</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            {/* Left: Fields List */}
                            <div className="md:col-span-2 space-y-4 text-[11px] font-mono">
                              <div className="flex justify-between items-end border-b border-slate-900 pb-1">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Field</span>
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Details</span>
                              </div>
                              
                              <div className="flex justify-between items-end border-b border-slate-900/60 pb-1.5">
                                <span className="text-slate-500 font-medium">Clinic Name</span>
                                <span className="font-bold text-sky-400 text-right truncate pl-2">
                                  {clinicFormData.clinicName || "_______________"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-end border-b border-slate-900/60 pb-1.5">
                                <span className="text-slate-500 font-medium">Veterinarian</span>
                                <span className="font-bold text-slate-200 text-right truncate pl-2">
                                  {clinicFormData.veterinarianName || "_______________"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-end border-b border-slate-900/60 pb-1.5">
                                <span className="text-slate-500 font-medium">License No</span>
                                <span className="font-bold text-slate-200 text-right truncate pl-2">
                                  {clinicFormData.licenseNo || "_______________"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-end border-b border-slate-900/60 pb-1.5">
                                <span className="text-slate-500 font-medium">Address</span>
                                <span className="font-bold text-slate-200 text-right truncate pl-2">
                                  {clinicFormData.address || "_______________"}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-end border-b border-slate-900/60 pb-1.5">
                                <span className="text-slate-500 font-medium">Contact</span>
                                <span className="font-bold text-slate-200 text-right truncate pl-2">
                                  {clinicFormData.contact || "_______________"}
                                </span>
                              </div>
                            </div>
                            
                            {/* Right: Vet Seal Box */}
                            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between items-center text-center h-[220px] w-full relative overflow-hidden group shadow-inner">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Vet Seal Picture</span>
                              
                              <div className="my-auto w-full flex items-center justify-center">
                                {clinicFormData.sealUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={clinicFormData.sealUrl}
                                    alt="Accredited Veterinary Stamp Seal"
                                    className="max-h-28 object-contain rounded-lg border border-slate-800 shadow-md group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="opacity-30 group-hover:opacity-50 transition-opacity">
                                    <StampIcon />
                                  </div>
                                )}
                              </div>
                              <span className="text-[8px] text-slate-600 block mt-2 tracking-wide">Accredited Endorsement</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 pt-3 border-t border-slate-900 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                          <span>TC-VET-REG</span>
                          <span>PAGE 04</span>
                        </div>
                      </div>
                    </div>

                    {/* --- ADMINISTRATIVE INPUT CONSOLE PANEL --- */}
                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 lg:p-8 space-y-8 shadow-xl">
                      <div className="border-b border-slate-800/80 pb-4">
                        <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                          <span className="text-orange-500">🛠️</span> Passport Registry Control Console
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Configure sub-dermal RFID chip metrics and update accredited practice endorsement files directly.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        
                        {/* 1. MICROCHIP RECORD MANAGEMENT FORM */}
                        <form onSubmit={handleSaveMicrochip} className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/60 flex flex-col justify-between min-h-[460px]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">ISO RFID Tag Configuration</span>
                              <span className="text-[10px] text-slate-500 font-mono">Form 03-A</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                  Microchip No (15 digits) *
                                </label>
                                <input
                                  type="text"
                                  required
                                  maxLength={15}
                                  placeholder="e.g. 981022300092112"
                                  value={microchipFormData.microchipNo}
                                  onChange={e => setMicrochipFormData({ ...microchipFormData, microchipNo: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 transition-colors focus:ring-1 focus:ring-emerald-500/20"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                  ISO Standard
                                </label>
                                <input
                                  type="text"
                                  placeholder="11784/11785"
                                  value={microchipFormData.isoStandard}
                                  onChange={e => setMicrochipFormData({ ...microchipFormData, isoStandard: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                  Implant Date
                                </label>
                                <input
                                  type="date"
                                  value={microchipFormData.implantDate}
                                  onChange={e => setMicrochipFormData({ ...microchipFormData, implantDate: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                  Implant Location
                                </label>
                                <input
                                  type="text"
                                  placeholder="Neck/Shoulder"
                                  value={microchipFormData.implantLocation}
                                  onChange={e => setMicrochipFormData({ ...microchipFormData, implantLocation: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                  Vet/Clinic Facility
                                </label>
                                <input
                                  type="text"
                                  placeholder="Facility Name"
                                  value={microchipFormData.vetClinicName}
                                  onChange={e => setMicrochipFormData({ ...microchipFormData, vetClinicName: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                                />
                              </div>
                            </div>

                            <div className="pt-2">
                              <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                Barcode Sticker Upload
                              </label>
                              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-colors border border-slate-800 flex-shrink-0">
                                  <span>📁 Browse File</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploadingSticker}
                                    onChange={handleStickerUpload}
                                    className="hidden"
                                  />
                                </label>
                                <div className="text-[9px] text-slate-500 truncate">
                                  {uploadingSticker ? (
                                    <span className="text-emerald-400 animate-pulse">⚡ Streaming to Vercel Blob...</span>
                                  ) : microchipFormData.stickerUrl ? (
                                    <span className="text-emerald-500 font-mono">✓ Sticker Linked</span>
                                  ) : (
                                    <span>Upload barcode scan image</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-slate-900">
                            <button
                              type="submit"
                              disabled={microchipSaving}
                              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/10"
                            >
                              {microchipSaving ? "Committing RFID Registry..." : "Save Microchip Settings"}
                            </button>
                          </div>
                        </form>

                        {/* 2. REGISTERED VETERINARY DETAILS FORM */}
                        <form onSubmit={handleSaveClinic} className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/60 flex flex-col justify-between min-h-[460px]">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Medical Personnel Registry</span>
                              <span className="text-[10px] text-slate-500 font-mono">Form 03-B</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                  Clinic Name *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Titan Core Veterinary Hospital"
                                  value={clinicFormData.clinicName}
                                  onChange={e => setClinicFormData({ ...clinicFormData, clinicName: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sky-400 font-bold text-xs focus:outline-none focus:border-sky-500 transition-colors focus:ring-1 focus:ring-sky-500/20"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                  Veterinarian Name *
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Dr. Full Name"
                                  value={clinicFormData.veterinarianName}
                                  onChange={e => setClinicFormData({ ...clinicFormData, veterinarianName: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                  License No
                                </label>
                                <input
                                  type="text"
                                  placeholder="VET-REG-XXXX"
                                  value={clinicFormData.licenseNo}
                                  onChange={e => setClinicFormData({ ...clinicFormData, licenseNo: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-slate-700 transition-colors"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                  Address
                                </label>
                                <input
                                  type="text"
                                  placeholder="Street Address, City"
                                  value={clinicFormData.address}
                                  onChange={e => setClinicFormData({ ...clinicFormData, address: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                  Contact
                                </label>
                                <input
                                  type="text"
                                  placeholder="Phone / Email"
                                  value={clinicFormData.contact}
                                  onChange={e => setClinicFormData({ ...clinicFormData, contact: e.target.value })}
                                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                                />
                              </div>
                            </div>

                            <div className="pt-2">
                              <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider">
                                Vet Seal Image Upload
                              </label>
                              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                                <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-sky-400 px-3 py-1.5 rounded-lg text-[10px] font-mono transition-colors border border-slate-800 flex-shrink-0">
                                  <span>📁 Browse File</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploadingSeal}
                                    onChange={handleSealUpload}
                                    className="hidden"
                                  />
                                </label>
                                <div className="text-[9px] text-slate-500 truncate">
                                  {uploadingSeal ? (
                                    <span className="text-sky-400 animate-pulse">⚡ Streaming to Vercel Blob...</span>
                                  ) : clinicFormData.sealUrl ? (
                                    <span className="text-sky-500 font-mono">✓ Seal Linked</span>
                                  ) : (
                                    <span>Upload digital seal stamp</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-slate-900">
                            <button
                              type="submit"
                              disabled={clinicSaving}
                              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-sky-600/10"
                            >
                              {clinicSaving ? "Persisting Registry..." : "Save Veterinary Details"}
                            </button>
                          </div>
                        </form>

                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: LIVE VACCINATION REGISTRY (PDF Page 4 & 7) */}
              {activeTab === "vaccines" && (
                <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-[700px]">
                  <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div>
                        <div className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-0.5">
                          Accredited Clinical Log
                        </div>
                        <h3 className="text-lg font-bold text-white">LIVE VACCINATION REGISTRY</h3>
                        <p className="text-xs text-slate-400">Manage real-time persistent immunizations tracking core protections and custom booster metrics.</p>
                      </div>

                      <button
                        type="button"
                        onClick={startAddVac}
                        className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/20 self-start sm:self-auto"
                      >
                        <span>➕</span>
                        <span>Log Vaccination Entry</span>
                      </button>
                    </div>

                    {/* Interactive Form Panel */}
                    {showVacForm && (
                      <form onSubmit={handleSaveVaccination} className="p-5 rounded-2xl bg-slate-950 border border-orange-500/30 space-y-4 animate-fade-in text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                          <span className="font-bold text-orange-400">
                            {editingVacId ? "Update Committed Vaccination Block" : "Commit New Immunization Log"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowVacForm(false)}
                            className="text-[10px] text-slate-500 hover:text-slate-300"
                          >
                            Close Panel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 uppercase mb-1">Vaccine Category *</label>
                            <select
                              value={vacFormData.vaccineCategory}
                              onChange={(e) => setVacFormData({ ...vacFormData, vaccineCategory: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                            >
                              <option value="Rabies">Rabies Verification</option>
                              <option value="Core">Core / Species Booster</option>
                              <option value="Additional">Supplemental / Travel</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-slate-500 uppercase mb-1">Vaccine Brand / Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Nobivac Rabies, FVRCP Core"
                              value={vacFormData.vaccineName}
                              onChange={(e) => setVacFormData({ ...vacFormData, vaccineName: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 uppercase mb-1">Batch / Serial No</label>
                            <input
                              type="text"
                              placeholder="B-992184"
                              value={vacFormData.batchNo}
                              onChange={(e) => setVacFormData({ ...vacFormData, batchNo: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 uppercase mb-1">Date Administered *</label>
                            <input
                              type="date"
                              required
                              value={vacFormData.dateGiven}
                              onChange={(e) => setVacFormData({ ...vacFormData, dateGiven: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 uppercase mb-1">Valid Until / Due</label>
                            <input
                              type="date"
                              value={vacFormData.validUntilNextDue}
                              onChange={(e) => setVacFormData({ ...vacFormData, validUntilNextDue: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-500 uppercase mb-1">Accredited Veterinary Clinic</label>
                          <select
                            value={vacFormData.vetId}
                            onChange={(e) => setVacFormData({ ...vacFormData, vetId: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs"
                          >
                            <option value="">-- Standalone Self-Administered / Offline Stamp --</option>
                            {clinics.map((c: any) => (
                              <option key={c.id} value={c.id}>
                                {c.clinicName} (Lic: {c.licenseNo})
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={vacFormLoading}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs transition-all shadow"
                        >
                          {vacFormLoading ? "Writing Record Storage..." : "Persist Certified Log to Passport"}
                        </button>
                      </form>
                    )}

                    {/* Displaying Live Roster */}
                    {vaccinations.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500 space-y-2">
                        <div>💉</div>
                        <p>No verified live immunizations mapped under this booklet record signature. Use the intake trigger to log official stamps.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {vaccinations.map((vac: any) => {
                          const categoryColor = 
                            vac.vaccineCategory === "Rabies" 
                              ? "text-orange-400 bg-orange-500/10 border-orange-500/20" 
                              : vac.vaccineCategory === "Core" 
                              ? "text-sky-400 bg-sky-500/10 border-sky-500/20" 
                              : "text-purple-400 bg-purple-500/10 border-purple-500/20";

                          return (
                            <div
                              key={vac.id}
                              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${categoryColor}`}>
                                    {vac.vaccineCategory}
                                  </span>
                                  <span className="font-bold text-slate-200 text-sm truncate">
                                    {vac.vaccineName}
                                  </span>
                                </div>

                                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span>Given: <strong className="text-slate-300 font-mono">{new Date(vac.dateGiven).toLocaleDateString()}</strong></span>
                                  {vac.validUntilNextDue && (
                                    <span>Due: <strong className="text-orange-400 font-mono">{new Date(vac.validUntilNextDue).toLocaleDateString()}</strong></span>
                                  )}
                                  {vac.batchNo && (
                                    <span>Batch: <code className="text-slate-500 bg-slate-900 px-1 rounded">{vac.batchNo}</code></span>
                                  )}
                                </div>

                                {vac.veterinaryClinic && (
                                  <div className="text-[10px] text-slate-500 pt-0.5 flex items-center gap-1">
                                    <span>🏥 Accredited Base:</span>
                                    <span className="text-slate-400 font-semibold">{vac.veterinaryClinic.clinicName}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <span className="hidden sm:inline-block text-right text-emerald-500 font-mono text-[9px] font-bold pr-2 border-r border-slate-800">
                                  ✓ SECURE STAMP
                                </span>
                                <button
                                  type="button"
                                  onClick={() => startEditVac(vac)}
                                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-sky-400 text-xs font-bold border border-slate-800 transition-all"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVaccination(vac.id)}
                                  className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all"
                                >
                                  Revoke
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="text-base">🛡️</span>
                      <p>Updates write instantly to cascading data storage partitions fulfilling continuous compliance constraints for border clearance logs.</p>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 4: ADDITIONAL TESTS & DEWORMING (PDF Page 5 & 6) */}
              {activeTab === "medical" && (
                <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-[700px]">
                  <div className="max-w-4xl mx-auto space-y-10">
                    
                    {/* Rabies Titer Test Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <div>
                        <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">
                          International Titer Registry
                        </div>
                        <h3 className="text-lg font-bold text-white mb-4">RABIES TITER TEST</h3>

                        <div className="space-y-2 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                          <div className="grid grid-cols-2 py-1.5 border-b border-slate-900">
                            <span className="text-slate-500">Sample Date</span>
                            <span className="font-mono text-slate-200">//20__</span>
                          </div>
                          <div className="grid grid-cols-2 py-1.5 border-b border-slate-900">
                            <span className="text-slate-500">Lab Name</span>
                            <span className="text-slate-400 italic">__________________</span>
                          </div>
                          <div className="grid grid-cols-2 py-1.5 border-b border-slate-900">
                            <span className="text-slate-500">Result</span>
                            <span className="font-mono text-slate-400">______ IU/ml</span>
                          </div>
                          <div className="grid grid-cols-2 py-1.5 border-b border-slate-900">
                            <span className="text-slate-500">Report No</span>
                            <span className="font-mono text-slate-400">__________</span>
                          </div>
                          <div className="grid grid-cols-2 py-1.5">
                            <span className="text-slate-500">Approved</span>
                            <span className="text-slate-600 font-bold">Yes / No</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Vaccinations Matrix */}
                      <div>
                        <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">
                          Supplemental Prevention
                        </div>
                        <h3 className="text-lg font-bold text-white mb-4">ADDITIONAL VACCINATIONS</h3>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                            <span className="font-medium text-slate-300">Kennel Cough</span>
                            <span className="text-slate-600 font-mono text-[10px]">Uncertified</span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                            <span className="font-medium text-slate-300">Leptospirosis</span>
                            <span className="text-slate-600 font-mono text-[10px]">Uncertified</span>
                          </div>
                          <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                            <span className="font-medium text-slate-300">FeLV (Cats)</span>
                            <span className="text-slate-600 font-mono text-[10px]">Uncertified</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Parasite & Surgery Logs Container */}
                    <div className="pt-8 border-t border-slate-800 space-y-6">
                      <div>
                        <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                          Parasitic Defenses
                        </div>
                        <h3 className="text-sm font-bold text-white mb-3">INTERNAL & EXTERNAL PARASITE TREATMENT</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Deworming (Internal)</span>
                            <div className="text-xs text-slate-400 space-y-1">
                              <div className="flex justify-between"><span className="text-slate-600">Product:</span><span>Drontal Plus</span></div>
                              <div className="flex justify-between"><span className="text-slate-600">Dose:</span><span>1 Tab</span></div>
                              <div className="flex justify-between"><span className="text-slate-600">Next Due:</span><span className="font-mono text-amber-400">10/08/2025</span></div>
                            </div>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Flea & Tick (External)</span>
                            <div className="text-xs text-slate-400 space-y-1">
                              <div className="flex justify-between"><span className="text-slate-600">Product:</span><span>Frontline Combo</span></div>
                              <div className="flex justify-between"><span className="text-slate-600">Dose:</span><span>1 Pipette</span></div>
                              <div className="flex justify-between"><span className="text-slate-600">Next Due:</span><span className="font-mono text-amber-400">10/07/2025</span></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Surgery/Procedure Record */}
                      <div className="pt-4 border-t border-slate-800/60">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase mb-2">Medical & Surgery Notes</span>
                        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs italic text-slate-500">
                          Continuous monitoring authorized. No invasive surgical diagnostics required at target timeline. Standard clinical recovery arrays intact.
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </>
    )}

      </div>

    </div>
  );
}

// Wrap complete logic within a suspended parent to guarantee pure client hydration
export default function PassportBookletPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 font-mono text-sm animate-pulse">
        Initializing Dynamic Booklet Arrays...
      </div>
    }>
      <PassportBookletContent />
    </Suspense>
  );
}
