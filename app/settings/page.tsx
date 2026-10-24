"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/components/ui";

export default function SettingsPage() {
  const router = useRouter();
  
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);

  // User Data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load User & Theme
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/login");
          return;
        }
        setEmail(session.user.email || "");

        // FIX (Task 1): Removed 'phone' AND 'portfolio_url' from the select query.
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
        // Simulate a tiny delay for smooth transition
        setTimeout(() => setFetchingUser(false), 300); 
      }
    };
    fetchUserData();
  }, [router]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return router.push("/login");

      // FIX (Task 1): Removed 'phone' AND 'portfolio_url' from the upsert query.
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        full_name: fullName,
        location: location,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setStatusMessage({ type: "success", text: "Details saved successfully." });
      setOpenSection(null); 
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  // --- SKELETON LOADER (Task 2) ---
  if (fetchingUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
        <div className="mb-8 space-y-3">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        
        <div className="space-y-6">
          {/* Profile Card Skeleton */}
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
          {/* Bottom Card Skeleton */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const initials = fullName ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account and preferences.</p>
      </div>

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
        
        {/* PROFILE CARD */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
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
            
            {/* Personal Details */}
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
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / Location" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition">
                      {loading ? "Saving..." : "Save Details"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div>
              <button onClick={() => setOpenSection(openSection === "notifications" ? null : "notifications")} className="flex w-full items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <Icon name="bell" size={18} /> Notifications
                </div>
                <span className={`transition-transform duration-200 ${openSection === "notifications" ? "rotate-90" : ""}`}>
                  <Icon name="chevron" size={16} />
                </span>
              </button>
              {openSection === "notifications" && (
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                  Notification preferences coming soon.
                </div>
              )}
            </div>

            {/* Appearance */}
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

            {/* Privacy & Security */}
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
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                  Your data is securely stored. We do not share your personal details with employers without your permission.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUPPORT & ABOUT CARD */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          <a href="mailto:support@vouch.app" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
              <Icon name="arrow" size={18} /> Help centre
            </div>
            <span className="transition-transform duration-200">
              <Icon name="chevron" size={16} />
            </span>
          </a>
          
          {/* About Vouch */}
          <div>
            <button onClick={() => setOpenSection(openSection === "about" ? null : "about")} className="flex w-full items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Icon name="briefcase" size={18} /> About Vouch
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">v0.9.0</span>
                <span className={`transition-transform duration-200 ${openSection === "about" ? "rotate-90" : ""}`}>
                  <Icon name="chevron" size={16} />
                </span>
              </div>
            </button>
            {openSection === "about" && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Vouch v0.9.0 (Hackathon Beta)</p>
                <p>Empowering informal work through verified skills. Built for opportunity in Southern Africa.</p>
              </div>
            )}
          </div>
        </div>

        {/* LOGOUT */}
        <button onClick={handleLogout} className="w-full py-4 text-center text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm">
          Log out
        </button>

        <p className="text-center text-xs font-semibold text-slate-400 dark:text-slate-600 mt-8">
          Empowering informal work through verified skills.
        </p>
      </div>
    </div>
  );
}