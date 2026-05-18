"use client";

import React, { useState, useEffect, Suspense } from "react";
import { api } from "../../lib/axios";

// Helper Vector Accents
const PawSmallIcon = () => (
  <svg className="w-3.5 h-3.5 text-orange-400 inline mr-1" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c-1.66 0-3 1.34-3 3 0 2 1 3 3 3s3-1 3-3c0-1.66-1.34-3-3-3zm-4.5-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm9 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-11-4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm13 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
  </svg>
);

function GuardianPortalContent() {
  // Session / Authentication state
  const [activeOwner, setActiveOwner] = useState<any | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Owner Update Profile form data
  const [updateOwnerLoading, setUpdateOwnerLoading] = useState(false);
  const [ownerProfileData, setOwnerProfileData] = useState({
    fullName: "",
    mobile: "",
    passportNic: "",
    address: "",
    country: "",
    emergencyContactName: "",
    emergencyContactPhone: ""
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Attached Pet creation states
  const [showAddPetForm, setShowAddPetForm] = useState(false);
  const [addPetLoading, setAddPetLoading] = useState(false);
  const [newPetData, setNewPetData] = useState({
    name: "",
    species: "Dog",
    breed: "",
    gender: "Male",
    colorMarkings: "",
    sterilized: false,
    dob: "",
    photoUrl: "",
    image: ""
  });

  // Dedicated Pet Editing states
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [editPetLoading, setEditPetLoading] = useState(false);
  const [editPetFormData, setEditPetFormData] = useState({
    name: "",
    species: "Dog",
    breed: "",
    gender: "Male",
    colorMarkings: "",
    sterilized: false,
    dob: "",
    photoUrl: "",
    image: ""
  });

  // Hydrate active owner session signature from client side persistent localStorage
  useEffect(() => {
    const cachedEmail = typeof window !== "undefined" ? localStorage.getItem("titan_core_active_owner_email") : null;
    if (cachedEmail) {
      executeSilentSessionRestore(cachedEmail);
    } else {
      setSessionLoading(false);
    }
  }, []);

  async function executeSilentSessionRestore(email: string) {
    try {
      const res = await api.post("/owners/restore", { email });
      setActiveOwner(res.data);
      initializeOwnerEditState(res.data);
    } catch (err) {
      console.error("Session integrity invalid. Signature payload mismatch.", err);
      if (typeof window !== "undefined") localStorage.removeItem("titan_core_active_owner_email");
    } finally {
      setSessionLoading(false);
    }
  }

  // Set up values for owner parameter edits
  function initializeOwnerEditState(ownerObj: any) {
    setOwnerProfileData({
      fullName: ownerObj.fullName || "",
      mobile: ownerObj.mobile || "",
      passportNic: ownerObj.passportNic || "",
      address: ownerObj.address || "",
      country: ownerObj.country || "",
      emergencyContactName: ownerObj.emergencyContactName || "",
      emergencyContactPhone: ownerObj.emergencyContactPhone || ""
    });
  }

  // Reload current logged in user state live to ensure deep tree sub-resources refresh
  async function reloadActiveOwnerSession() {
    if (!activeOwner?.email) return;
    try {
      const res = await api.post("/owners/restore", { email: activeOwner.email });
      setActiveOwner(res.data);
      initializeOwnerEditState(res.data);
    } catch (err) {
      console.error("Failed executing user sub-resource tree sync:", err);
    }
  }

  // File Uploader conversion utility for pictures
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = reader.result as string;
      if (isEditMode) {
        setEditPetFormData(prev => ({ ...prev, photoUrl: base64Str, image: base64Str }));
      } else {
        setNewPetData(prev => ({ ...prev, photoUrl: base64Str, image: base64Str }));
      }
    };
    reader.readAsDataURL(file);
  }

  function handleLogout() {
    setActiveOwner(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("titan_core_active_owner_email");
      window.location.href = "/login";
    }
  }

  async function handleUpdateOwnerProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOwner) return;
    setUpdateOwnerLoading(true);
    setProfileSuccessMsg("");
    try {
      await api.put(`/owners/${activeOwner.id}`, ownerProfileData);
      await reloadActiveOwnerSession();
      setProfileSuccessMsg("Guardian settings securely updated on persistent database core.");
      setTimeout(() => setProfileSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Profile updates rejected:", err);
      alert("Failed updating guardian account details.");
    } finally {
      setUpdateOwnerLoading(false);
    }
  }

  async function handleCreateAttachedPet(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOwner) return;
    setAddPetLoading(true);
    try {
      await api.post(`/owners/${activeOwner.id}/pets`, newPetData);
      await reloadActiveOwnerSession();
      setShowAddPetForm(false);
      setNewPetData({
        name: "",
        species: "Dog",
        breed: "",
        gender: "Male",
        colorMarkings: "",
        sterilized: false,
        dob: "",
        photoUrl: "",
        image: ""
      });
    } catch (err) {
      console.error("Failed writing attached pet partition:", err);
      alert("Failed allocating pet verification schema.");
    } finally {
      setAddPetLoading(false);
    }
  }

  function startEditPet(pet: any) {
    setEditingPetId(pet.id);
    setEditPetFormData({
      name: pet.name || "",
      species: pet.species || "Dog",
      breed: pet.breed || "",
      gender: pet.gender || "Male",
      colorMarkings: pet.colorMarkings || "",
      sterilized: !!pet.sterilized,
      dob: pet.dob ? pet.dob.split("T")[0] : "",
      photoUrl: pet.photoUrl || pet.image || "",
      image: pet.image || pet.photoUrl || ""
    });
  }

  async function handleCommitPetUpdate(e: React.FormEvent, petId: string) {
    e.preventDefault();
    setEditPetLoading(true);
    try {
      await api.put(`/pets/${petId}`, editPetFormData);
      await reloadActiveOwnerSession();
      setEditingPetId(null);
    } catch (err) {
      console.error("Failed updating persistent pet structures:", err);
      alert("Failed committing pet database adjustments.");
    } finally {
      setEditPetLoading(false);
    }
  }

  async function handleRevokeAttachedPet(petId: string) {
    if (!confirm("Are you absolutely confident you want to revoke this attached pet partition along with cascading clinical records permanently?")) return;
    try {
      await api.delete(`/pets/${petId}`);
      await reloadActiveOwnerSession();
    } catch (err) {
      console.error("Failed removing attached pet configuration:", err);
      alert("Failed revoking target pet registry.");
    }
  }

  if (sessionLoading) {
    return (
      <div className="w-full max-w-[1720px] mx-auto py-24 px-6 flex items-center justify-center text-slate-500 font-mono text-xs animate-pulse">
        Loading Guardian Workspace...
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto py-10 px-6 flex-1 flex flex-col gap-8">

      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">
            Guardian Lifecycle Access
          </div>
          <h1 className="text-2xl font-black text-white">
            {activeOwner ? `Guardian: ${activeOwner.fullName}` : "Guardian Portal & Account Gateway"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeOwner
              ? "Manage private guardian security details, register attached pet passports, and update clinical logs seamlessly."
              : "Access your private repository to review or update your domestic animals and official clinical travel passports."}
          </p>
        </div>

        {activeOwner && (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Active Account</span>
              <span className="text-xs text-slate-300 font-mono">{activeOwner.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700"
            >
              Sign Out Session
            </button>
          </div>
        )}
      </div>

      {/* VIEW A: UNAUTHENTICATED INTAKE / LOGIN FLOW */}
      {!activeOwner ? (
        <div className="max-w-xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-10 shadow-2xl mt-8 text-center space-y-6 animate-fade-in relative overflow-hidden">

          {/* Subtle Accent Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 text-3xl mb-2 shadow-inner">
            🛡️
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Private Gateway Authorization Required</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              The Guardian Hub is a private digital partition. Please sign in to authenticate your access tokens or spawn a new identity repository.
            </p>
          </div>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/login"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs tracking-wider transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
            >
              <span>🔑 Sign In Gateway</span>
            </a>

            <a
              href="/register"
              className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 text-emerald-400 hover:text-emerald-300 font-bold text-xs tracking-wider border border-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>📝 Create Account</span>
            </a>
          </div>

          <div className="pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-center gap-2">
            <span>⚡ Fulfills distinct routing segmentation rules across Next.js sub-pages</span>
          </div>

        </div>
      ) : (

        /* VIEW B: AUTHENTICATED GUARDIAN WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in">

          {/* COLUMN 1: GUARDIAN ACCOUNT CONFIGURATIONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Guardian Credentials
              </h2>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold animate-fade-in">
                {profileSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpdateOwnerProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={ownerProfileData.fullName}
                  onChange={(e) => setOwnerProfileData({ ...ownerProfileData, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Account Signature (Locked)</label>
                <input
                  type="text"
                  disabled
                  value={activeOwner.email}
                  className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800/40 rounded-xl text-slate-500 font-mono select-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Mobile Contact</label>
                <input
                  type="text"
                  value={ownerProfileData.mobile}
                  onChange={(e) => setOwnerProfileData({ ...ownerProfileData, mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Passport / NIC Stamp</label>
                <input
                  type="text"
                  value={ownerProfileData.passportNic}
                  onChange={(e) => setOwnerProfileData({ ...ownerProfileData, passportNic: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Primary Base Address</label>
                <input
                  type="text"
                  value={ownerProfileData.address}
                  onChange={(e) => setOwnerProfileData({ ...ownerProfileData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase mb-1">Country Base</label>
                <input
                  type="text"
                  value={ownerProfileData.country}
                  onChange={(e) => setOwnerProfileData({ ...ownerProfileData, country: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Emergency Contact</span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase mb-0.5">Name</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={ownerProfileData.emergencyContactName}
                      onChange={(e) => setOwnerProfileData({ ...ownerProfileData, emergencyContactName: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase mb-0.5">Contact Number</label>
                    <input
                      type="text"
                      placeholder="Contact Number"
                      value={ownerProfileData.emergencyContactPhone}
                      onChange={(e) => setOwnerProfileData({ ...ownerProfileData, emergencyContactPhone: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateOwnerLoading}
                className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-all shadow mt-4"
              >
                {updateOwnerLoading ? "Persisting Updates..." : "Save Account"}
              </button>
            </form>
          </div>

          {/* COLUMN 2 & 3: ROSTER OF MY REGISTERED PETS */}
          <div className="lg:col-span-2 space-y-6">

            {/* Action Bar Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Enter your pets information here</span>
                  <span className="text-xs font-mono font-normal text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    {activeOwner.pets?.length || 0} Passports
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5"> </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddPetForm(!showAddPetForm)}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/20 self-start sm:self-auto shrink-0"
              >
                <span>{showAddPetForm ? "✕ Close Intake" : "➕ Add New Pet Profile"}</span>
              </button>
            </div>

            {/* SUB-FORM INTAKE UI: PRECISELY MATCHING THE USER'S DIAGRAM */}
            {showAddPetForm && (
              <form onSubmit={handleCreateAttachedPet} className="p-6 rounded-2xl bg-slate-950 border-2 border-orange-500/40 space-y-6 animate-fade-in text-xs shadow-2xl relative overflow-hidden">
                <div className="pb-3 border-b border-slate-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-orange-400 text-sm block">PET INFORMATION</span>
                    <span className="text-[10px] text-slate-500">Official registry your pets informations</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    Pet Photo Box (4cm x 4cm)
                  </span>
                </div>

                {/* SIDE-BY-SIDE MATRIX LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">

                  {/* Left Side: Field Input Grid (3 cols span) */}
                  <div className="md:col-span-3 space-y-3">
                    <div className="grid grid-cols-3 items-center pb-1 border-b border-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Field</span>
                      <span className="col-span-2">Details</span>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="font-bold text-slate-400">Pet Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bella"
                        value={newPetData.name}
                        onChange={(e) => setNewPetData({ ...newPetData, name: e.target.value })}
                        className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="font-bold text-slate-400">Species</label>
                      <select
                        value={newPetData.species}
                        onChange={(e) => setNewPetData({ ...newPetData, species: e.target.value })}
                        className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="font-bold text-slate-400">Breed</label>
                      <input
                        type="text"
                        placeholder="Golden Retriever"
                        value={newPetData.breed}
                        onChange={(e) => setNewPetData({ ...newPetData, breed: e.target.value })}
                        className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="font-bold text-slate-400 truncate">Color / Markings</label>
                      <input
                        type="text"
                        placeholder="Golden / Cream"
                        value={newPetData.colorMarkings}
                        onChange={(e) => setNewPetData({ ...newPetData, colorMarkings: e.target.value })}
                        className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="font-bold text-slate-400">Gender</label>
                      <select
                        value={newPetData.gender}
                        onChange={(e) => setNewPetData({ ...newPetData, gender: e.target.value })}
                        className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="font-bold text-slate-400">DOB</label>
                      <input
                        type="date"
                        value={newPetData.dob}
                        onChange={(e) => setNewPetData({ ...newPetData, dob: e.target.value })}
                        className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="font-bold text-slate-400">Sterilized</label>
                      <select
                        value={newPetData.sterilized ? "Yes" : "No"}
                        onChange={(e) => setNewPetData({ ...newPetData, sterilized: e.target.value === "Yes" })}
                        className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Side: Big Picture Frame (2 cols span) */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center pt-6 md:pt-0">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-wider text-center">
                      Upload Picture
                    </label>

                    <div className="relative w-40 h-40 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 hover:border-orange-500 transition-all flex flex-col items-center justify-center cursor-pointer group overflow-hidden shadow-inner">
                      {newPetData.photoUrl ? (
                        <img
                          src={newPetData.photoUrl}
                          alt="Pet Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-3 text-slate-600 group-hover:text-orange-400 transition-colors">
                          <span className="text-3xl block mb-1">📷</span>
                          <span className="text-[10px] block">Click to select photo</span>
                          <span className="text-[8px] text-slate-500 block mt-0.5">Square size ideal</span>
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, false)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>

                    {newPetData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setNewPetData({ ...newPetData, photoUrl: "" })}
                        className="text-[10px] text-rose-400 hover:underline mt-1 block"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>

                </div>

                <div className="pt-2 border-t border-slate-900">
                  <button
                    type="submit"
                    disabled={addPetLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs tracking-wider transition-all shadow-lg"
                  >
                    {addPetLoading ? "Binding Partition Storage..." : "Confirm"}
                  </button>
                </div>
              </form>
            )}

            {/* CARD LIST RENDERING: SHOWING EACH AS VIEW, UPDATE, DELETE */}
            {!activeOwner.pets || activeOwner.pets.length === 0 ? (
              <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 space-y-3">
                <div className="text-3xl">🐾</div>
                <p>No added pets registered below. An owner can track one or multiple companions. Add your pets to track them.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOwner.pets.map((pet: any) => {
                  const isEditing = editingPetId === pet.id;

                  // LIVE UPDATE MODE EMBED: DUAL LAYOUT VIEW FOR EDITING PICTURE BOX TOO
                  if (isEditing) {
                    return (
                      <form
                        key={pet.id}
                        onSubmit={(e) => handleCommitPetUpdate(e, pet.id)}
                        className="p-6 rounded-2xl bg-slate-950 border-2 border-sky-500/40 space-y-6 animate-fade-in text-xs shadow-xl relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                          <div>
                            <span className="font-bold text-sky-400 text-sm block">UPDATING PET INFORMATION</span>
                            <span className="text-[10px] text-slate-500">Live configuration updates matching existing ID</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingPetId(null)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-300 px-2 py-1 bg-slate-900 rounded border border-slate-800"
                          >
                            Cancel Modifications
                          </button>
                        </div>

                        {/* Side-by-side editing columns */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">

                          {/* Left Parameters */}
                          <div className="md:col-span-3 space-y-3">
                            <div className="grid grid-cols-3 items-center gap-2">
                              <label className="font-bold text-slate-400">Pet Name</label>
                              <input
                                type="text"
                                required
                                value={editPetFormData.name}
                                onChange={(e) => setEditPetFormData({ ...editPetFormData, name: e.target.value })}
                                className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                              />
                            </div>

                            <div className="grid grid-cols-3 items-center gap-2">
                              <label className="font-bold text-slate-400">Species</label>
                              <select
                                value={editPetFormData.species}
                                onChange={(e) => setEditPetFormData({ ...editPetFormData, species: e.target.value })}
                                className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs"
                              >
                                <option value="Dog">Dog</option>
                                <option value="Cat">Cat</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-2">
                              <label className="font-bold text-slate-400">Breed</label>
                              <input
                                type="text"
                                value={editPetFormData.breed}
                                onChange={(e) => setEditPetFormData({ ...editPetFormData, breed: e.target.value })}
                                className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                              />
                            </div>

                            <div className="grid grid-cols-3 items-center gap-2">
                              <label className="font-bold text-slate-400 truncate">Color / Markings</label>
                              <input
                                type="text"
                                value={editPetFormData.colorMarkings}
                                onChange={(e) => setEditPetFormData({ ...editPetFormData, colorMarkings: e.target.value })}
                                className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                              />
                            </div>

                            <div className="grid grid-cols-3 items-center gap-2">
                              <label className="font-bold text-slate-400">Gender</label>
                              <select
                                value={editPetFormData.gender}
                                onChange={(e) => setEditPetFormData({ ...editPetFormData, gender: e.target.value })}
                                className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-3 items-center gap-2">
                              <label className="font-bold text-slate-400">DOB</label>
                              <input
                                type="date"
                                value={editPetFormData.dob}
                                onChange={(e) => setEditPetFormData({ ...editPetFormData, dob: e.target.value })}
                                className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                              />
                            </div>

                            <div className="grid grid-cols-3 items-center gap-2">
                              <label className="font-bold text-slate-400">Sterilized</label>
                              <select
                                value={editPetFormData.sterilized ? "Yes" : "No"}
                                onChange={(e) => setEditPetFormData({ ...editPetFormData, sterilized: e.target.value === "Yes" })}
                                className="col-span-2 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs"
                              >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </div>
                          </div>

                          {/* Right Upload Frame updates */}
                          <div className="md:col-span-2 flex flex-col items-center justify-center pt-4 md:pt-0">
                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-wider text-center">
                              Change Picture Box
                            </label>

                            <div className="relative w-36 h-36 rounded-2xl border-2 border-dashed border-sky-500/40 bg-slate-900 hover:border-sky-500 transition-all flex flex-col items-center justify-center cursor-pointer group overflow-hidden shadow-inner">
                              {editPetFormData.photoUrl ? (
                                <img
                                  src={editPetFormData.photoUrl}
                                  alt="Pet Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center p-2 text-slate-600 group-hover:text-sky-400 transition-colors">
                                  <span className="text-2xl block mb-1">📷</span>
                                  <span className="text-[9px] block">Drop new square image</span>
                                </div>
                              )}

                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(e, true)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                            </div>

                            {editPetFormData.photoUrl && (
                              <button
                                type="button"
                                onClick={() => setEditPetFormData({ ...editPetFormData, photoUrl: "" })}
                                className="text-[10px] text-rose-400 hover:underline mt-1 block"
                              >
                                Revoke Image
                              </button>
                            )}
                          </div>

                        </div>

                        <div className="pt-2 border-t border-slate-900">
                          <button
                            type="submit"
                            disabled={editPetLoading}
                            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs tracking-wider transition-all shadow"
                          >
                            {editPetLoading ? "Writing Record Updates..." : "Commit Updated Companion Attributes"}
                          </button>
                        </div>
                      </form>
                    );
                  }

                  // STUNNING CARD LIST VIEW RENDERING
                  return (
                    <div
                      key={pet.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition-all shadow-xl flex flex-col gap-5 group"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-5">

                        {/* Img frame square on the left */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative group-hover:border-orange-500/40 transition-all shadow-md flex items-center justify-center self-center sm:self-auto">
                          {(pet.photoUrl || pet.image) ? (
                            <img
                              src={pet.photoUrl || pet.image}
                              alt={pet.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-slate-700 flex flex-col items-center justify-center space-y-1">
                              <span className="text-2xl">🐾</span>
                              <span className="text-[8px] uppercase tracking-wider text-slate-600 block">No Picture</span>
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 py-0.5 text-[8px] font-mono text-center text-slate-400 border-t border-slate-800/80">
                            4cm x 4cm
                          </div>
                        </div>

                        {/* Pet info table matrix layout */}
                        <div className="flex-1 min-w-0 w-full space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <h3 className="text-lg font-black text-white truncate">{pet.name}</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-orange-400 font-bold uppercase tracking-wider shrink-0">
                                {pet.species}
                              </span>
                              {pet.sterilized && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold shrink-0">
                                  Sterilized
                                </span>
                              )}
                            </div>

                            {/* View, Update, Delete Triggers */}
                            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                              <a
                                href={`/passport?petId=${pet.id}`}
                                className="px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/20 transition-all inline-flex items-center gap-1"
                              >
                                <span>📖 View Booklet</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => startEditPet(pet)}
                                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-sky-400 text-xs font-bold border border-slate-800 transition-all"
                              >
                                Update
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRevokeAttachedPet(pet.id)}
                                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Data mapping columns grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Breed</span>
                              <span className="font-medium text-slate-200 truncate block">{pet.breed || "Mixed Hybrid"}</span>
                            </div>

                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Color / Markings</span>
                              <span className="font-medium text-slate-200 truncate block">{pet.colorMarkings || "Standard Signature"}</span>
                            </div>

                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Gender</span>
                              <span className="font-medium text-slate-200 block">{pet.gender || "Unassigned"}</span>
                            </div>

                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-slate-500 block">DOB</span>
                              <span className="font-mono text-slate-300 block">{pet.dob ? new Date(pet.dob).toLocaleDateString() : "Unset"}</span>
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* Microchip status bar bottom preview */}
                      <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500">
                        <span>ISO microchip link sync state ready</span>
                        <span className="font-mono text-slate-400">
                          Vaccination logs allocated: <strong className="text-orange-400">{pet.vaccinations?.length || 0}</strong>
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default function GuardianPortalPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 font-mono text-xs animate-pulse">
        loading ....
      </div>
    }>
      <GuardianPortalContent />
    </Suspense>
  );
}
