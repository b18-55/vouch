"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/components/ui";

export default function SettingsPage() {
  const router = useRouter();
  
  // --- UI STATE ---
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- USER DATA STATE ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");

  // --- PASSWORD CHANGE STATE ---
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // --- DARK MODE STATE ---
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ==========================================
  // 1. LOAD USER DATA & THEME
  // ==========================================
  useEffect(() => {
    // Check if dark mode is currently active on the HTML tag
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/login");
          return;
        }
        setEmail(session.user.email || "");

        // Fetch profile data. 
        // Note from teammate: 'phone' and 'portfolio_url' were removed from this query 
        // because those columns don't exist in the database and were causing errors.
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, location")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || "");
          setLocation(profile.location || "");
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        // Small delay for a smooth skeleton-to-content transition
        setTimeout(() => setFetchingUser(false), 300); 
      }
    };
    fetchUserData();
  }, [router]);

  // ==========================================
  // 2. TOGGLE DARK MODE
  // ==========================================
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // ==========================================
  // 3. LOGOUT
  // ==========================================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ==========================================
  // 4. SAVE PROFILE DETAILS
  // ==========================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return router.push("/login");

      // Upsert means: If the row exists, update it. If it doesn't, create it.
      // We removed 'phone' and 'portfolio_url' here as well to prevent crashes.
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        full_name: fullName,
        location: location,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      
      setStatusMessage({ type: "success", text: "Details saved successfully." });
      setOpenSection(null); // Close the accordion on success
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 5. UPDATE PASSWORD (Added for Account Security)
  // ==========================================
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);
    setPasswordMessage(null);

    try {
      // Supabase handles the encryption and validation automatically.
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
      setNewPassword(""); // Clear the input
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // ==========================================
  // 6. SKELETON LOADER
  // ==========================================
  if (fetchingUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
        <div className="mb-8 space-y-3">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Helper to generate initials for the avatar
  const initials = fullName ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  // ==========================================
  // 7. RENDER UI
  // ==========================================
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account and preferences.</p>
      </div>

      {/* Global Success/Error Message */}
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${
          statusMessage.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
            : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
        }`}>
          {statusMessage.text}
        </div>
      )}

      <div className="space-y-6">
        
        {/* PROFILE CARD (Accordions) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          
          {/* User Header */}
          <div className="flex items-center gap-4 p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold">
              {initials}
            </div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white">{fullName || "Your Name"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            
            {/* SECTION 1: Personal Details */}
            <div>
              <button onClick={() => setOpenSection(openSection === "personal" ? null : "personal")} className="flex w-full items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Icon name="profile" size={18} /> Personal details
                </div>
                <span className={`transition-transform duration-200 ${openSection === "personal" ? "rotate-90" : ""}`}>
                  <Icon name="chevron" size={16} />
                </span>
              </button>
              
              {openSection === "personal" && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                  <form onSubmit={handleSave} className="space-y-4">
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / Location" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
                    <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition">
                      {loading ? "Saving..." : "Save Details"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* SECTION 2: Appearance (Dark Mode) */}
            <div>
              <button onClick={() => setOpenSection(openSection === "appearance" ? null : "appearance")} className="flex w-full items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Icon name="settings" size={18} /> Appearance
                </div>
                <span className={`transition-transform duration-200 ${openSection === "appearance" ? "rotate-90" : ""}`}>
                  <Icon name="chevron" size={16} />
                </span>
              </button>
              
              {openSection === "appearance" && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Dark Mode</span>
                  <button type="button" onClick={toggleDarkMode} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${isDarkMode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${isDarkMode ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 3: Privacy & Security (Password Change) */}
            <div>
              <button onClick={() => setOpenSection(openSection === "privacy" ? null : "privacy")} className="flex w-full items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Icon name="lock" size={18} /> Privacy & security
                </div>
                <span className={`transition-transform duration-200 ${openSection === "privacy" ? "rotate-90" : ""}`}>
                  <Icon name="chevron" size={16} />
                </span>
              </button>
              
              {openSection === "privacy" && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Your data is securely stored. We do not share your personal details with employers without your permission.
                  </p>
                  
                  {/* PASSWORD CHANGE FORM */}
                  <form onSubmit={handlePasswordUpdate} className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Change Password</p>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Enter new password (min 6 chars)" 
                      required
                      minLength={6}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" 
                    />
                    <button type="submit" disabled={updatingPassword} className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition">
                      {updatingPassword ? "Updating..." : "Update Password"}
                    </button>
                    
                    {passwordMessage && (
                      <p className={`text-xs font-bold mt-2 ${passwordMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {passwordMessage.text}
                      </p>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOGOUT */}
        <button onClick={handleLogout} className="w-full py-4 text-center text-sm font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-sm">
          Log out
        </button>

      </div>
    </div>
  );
}