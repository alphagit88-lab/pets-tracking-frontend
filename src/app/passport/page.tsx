"use client";

import React, { useState, useEffect, Suspense } from "react";
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
        const res = await api.get("/search?q=");
        const fetchedPets = res.data?.pets || [];
        setPetList(fetchedPets);

        // Map selection priority: Param ID -> First Pet -> Null
        if (initialPetId) {
          const match = fetchedPets.find((p: any) => p.id === initialPetId);
          if (match) {
            setSelectedPet(match);
          } else if (fetchedPets.length > 0) {
            setSelectedPet(fetchedPets[0]);
          }
        } else if (fetchedPets.length > 0) {
          setSelectedPet(fetchedPets[0]);
        }

        // Preload clinics dropdown array
        const clinRes = await api.get("/clinics");
        setClinics(clinRes.data || []);
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

  // File encodings for visual dropzones
  function handleStickerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = reader.result as string;
      setMicrochipFormData(prev => ({ ...prev, stickerUrl: base64Str }));
    };
    reader.readAsDataURL(file);
  }

  function handleSealUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = reader.result as string;
      setClinicFormData(prev => ({ ...prev, sealUrl: base64Str }));
    };
    reader.readAsDataURL(file);
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
    <div className="w-full max-w-[1720px] mx-auto py-10 px-6 flex-1 flex flex-col lg:flex-row gap-8">
      
      {/* Sidebar Navigation Selector: Digital Passport File System */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4 flex items-center justify-between">
            <span>Available Passports</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-mono text-[10px]">
              {petList.length} Active
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-800/40 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : petList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No digital passport signatures fully committed.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {petList.map((pet) => {
                const isSelected = selectedPet?.id === pet.id;
                return (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 border flex items-center gap-3 ${
                      isSelected
                        ? "bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/40 text-white shadow-md shadow-orange-500/5"
                        : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSelected ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                      {pet.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{pet.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {pet.species} • {pet.breed || "Hybrid"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Informative Security Seal Box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>Document Layout Replicas</span>
          </div>
          <p className="leading-relaxed">
            Rendered perfectly mirroring physical custom booklet assets (`pet Passport.pdf`) embedded with core photo markers, ISO tags, and continuous validation stamp placeholders.
          </p>
        </div>
      </div>

      {/* Main Content Area: Tabbed Digital Booklet View */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Booklet Controls Tab Header */}
        {selectedPet && (
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-2 rounded-2xl border border-slate-800 backdrop-blur-sm">
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

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950 text-slate-400 border border-slate-800/80 text-xs font-mono">
              <span>Booklet ID:</span>
              <span className="text-slate-200 font-bold">{selectedPet.id.split("-")[0]}</span>
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
                        <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-2 text-center text-slate-500 group relative">
                          <span className="text-xs font-bold text-slate-600">4cm x 4cm</span>
                          <span className="text-[9px] text-slate-600">Photo Box</span>
                          <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-slate-800/40 select-none">
                            {selectedPet.name.charAt(0)}
                          </div>
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

              {/* TAB 2: MICROCHIP & VETERINARY SIGNATURES (PDF Page 3) */}
              {activeTab === "microchip" && (
                <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-[700px]">
                  <div className="max-w-5xl mx-auto space-y-12">
                    
                    {/* --- 1. MICROCHIP RECORD SEGMENT FORM --- */}
                    <form onSubmit={handleSaveMicrochip} className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div>
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                            ISO Verification Array
                          </div>
                          <h3 className="text-xl font-extrabold text-white">MICROCHIP RECORD</h3>
                          <p className="text-xs text-slate-400">Configure core 15-digit sub-dermal scanner tags and visual sticker verification documents.</p>
                        </div>
                        <button
                          type="submit"
                          disabled={microchipSaving}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/10 self-start sm:self-auto"
                        >
                          {microchipSaving ? "Committing Tag..." : "Save Microchip Settings"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        
                        {/* Left Side: Standard Field Details */}
                        <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold mb-1">
                              Microchip No (15 digits) *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 981022300092112"
                              value={microchipFormData.microchipNo}
                              onChange={e => setMicrochipFormData({ ...microchipFormData, microchipNo: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold mb-1">
                              ISO Standard
                            </label>
                            <input
                              type="text"
                              placeholder="11784/11785"
                              value={microchipFormData.isoStandard}
                              onChange={e => setMicrochipFormData({ ...microchipFormData, isoStandard: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold mb-1">
                              Implant Date
                            </label>
                            <input
                              type="date"
                              value={microchipFormData.implantDate}
                              onChange={e => setMicrochipFormData({ ...microchipFormData, implantDate: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold mb-1">
                              Implant Location
                            </label>
                            <input
                              type="text"
                              placeholder="Neck/Shoulder"
                              value={microchipFormData.implantLocation}
                              onChange={e => setMicrochipFormData({ ...microchipFormData, implantLocation: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold mb-1">
                              Vet/Clinic
                            </label>
                            <input
                              type="text"
                              placeholder="Facility Name"
                              value={microchipFormData.vetClinicName}
                              onChange={e => setMicrochipFormData({ ...microchipFormData, vetClinicName: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Right Side: Interactive Drag/Upload base64 Sticker Dropzone */}
                        <div className="bg-slate-950 p-6 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col justify-between h-full min-h-[260px] relative group overflow-hidden">
                          <div className="text-xs font-bold text-slate-300 uppercase tracking-widest text-center">
                            Picture of microchip sticker
                          </div>

                          <div className="my-auto py-2 flex flex-col items-center justify-center w-full">
                            {microchipFormData.stickerUrl ? (
                              <div className="relative w-full max-h-40 flex justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={microchipFormData.stickerUrl}
                                  alt="Microchip Barcode Sticker Asset"
                                  className="max-h-36 object-contain rounded-lg border border-slate-800 shadow"
                                />
                                <button
                                  type="button"
                                  onClick={() => setMicrochipFormData({ ...microchipFormData, stickerUrl: "" })}
                                  className="absolute top-1 right-1 bg-slate-900/90 text-red-400 hover:text-red-300 p-1 rounded-md text-[10px]"
                                >
                                  ✕ Remove
                                </button>
                              </div>
                            ) : (
                              <div className="w-full py-2 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                                <MicrochipStickerIcon />
                              </div>
                            )}
                          </div>

                          <div className="mt-auto pt-2 border-t border-slate-900 text-center">
                            <label className="cursor-pointer inline-block px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 font-mono text-[10px] transition-colors border border-slate-800">
                              <span>📁 Select Barcode Image File</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleStickerUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                      </div>
                    </form>


                    {/* --- 2. REGISTERED VETERINARY DETAILS FORM --- */}
                    <form onSubmit={handleSaveClinic} className="pt-10 border-t border-slate-800 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div>
                          <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">
                            Accredited Operations
                          </div>
                          <h3 className="text-xl font-extrabold text-white">REGISTERED VETERINARY DETAILS</h3>
                          <p className="text-xs text-slate-400">Map operational clinic credentials and official physical ink seal images.</p>
                        </div>
                        <button
                          type="submit"
                          disabled={clinicSaving}
                          className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-sky-600/10 self-start sm:self-auto"
                        >
                          {clinicSaving ? "Persisting Registry..." : "Save Veterinary Details"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        
                        {/* Left Side: Standard Registry Metadata */}
                        <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold mb-1">
                              Clinic Name *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Titan Core Veterinary Hospital"
                              value={clinicFormData.clinicName}
                              onChange={e => setClinicFormData({ ...clinicFormData, clinicName: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sky-400 font-bold text-xs focus:outline-none focus:border-sky-500 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold mb-1">
                              Veterinarian *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Dr. Full Name"
                              value={clinicFormData.veterinarianName}
                              onChange={e => setClinicFormData({ ...clinicFormData, veterinarianName: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold mb-1">
                              License No
                            </label>
                            <input
                              type="text"
                              placeholder="VET-REG-XXXX"
                              value={clinicFormData.licenseNo}
                              onChange={e => setClinicFormData({ ...clinicFormData, licenseNo: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-slate-700 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              placeholder="Street Address, City"
                              value={clinicFormData.address}
                              onChange={e => setClinicFormData({ ...clinicFormData, address: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 font-bold mb-1">
                              Contact
                            </label>
                            <input
                              type="text"
                              placeholder="Phone / Email"
                              value={clinicFormData.contact}
                              onChange={e => setClinicFormData({ ...clinicFormData, contact: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-slate-700 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Right Side: Vet Seal Drag/Upload Picture dropzone canvas */}
                        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-full min-h-[260px] relative overflow-hidden group">
                          <div className="text-xs font-bold text-slate-300 uppercase tracking-widest text-center">
                            Vet Seal Picture
                          </div>

                          <div className="my-auto py-2 flex flex-col items-center justify-center w-full">
                            {clinicFormData.sealUrl ? (
                              <div className="relative w-full max-h-40 flex justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={clinicFormData.sealUrl}
                                  alt="Accredited Veterinary Stamp Seal Asset"
                                  className="max-h-36 object-contain rounded-lg border border-slate-800 shadow"
                                />
                                <button
                                  type="button"
                                  onClick={() => setClinicFormData({ ...clinicFormData, sealUrl: "" })}
                                  className="absolute top-1 right-1 bg-slate-900/90 text-red-400 hover:text-red-300 p-1 rounded-md text-[10px]"
                                >
                                  ✕ Remove
                                </button>
                              </div>
                            ) : (
                              <div className="w-full py-4 flex justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                                <StampIcon />
                              </div>
                            )}
                          </div>

                          <div className="mt-auto pt-2 border-t border-slate-900 text-center">
                            <label className="cursor-pointer inline-block px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 font-mono text-[10px] transition-colors border border-slate-800">
                              <span>🖨️ Upload Stamp Seal Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleSealUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                      </div>
                    </form>

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
