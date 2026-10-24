"use client";
// 'use client' indicates this is a Client Component running in the browser.

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter();
  
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "notifications" | "appearance">("profile");
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  // FIX: Removed 'phone' state because the column doesn't exist in the database yet.
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("South Africa");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Account Security States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Preference & Dark Mode States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ==========================================
  // 2. FETCH USER & PROFILE DATA
  // ==========================================
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push("/login");
          return;
        }

        setEmail(session.user.email || "");

        // FIX: Removed 'phone' from the select query to prevent database errors.
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, location, country, bio, portfolio_url")
          .eq("id", session.user.id)
          .single();

        if (!error && profile) {
          setFullName(profile.full_name || "");
          setLocation(profile.location || "");
          setCountry(profile.country || "South Africa");
          setBio(profile.bio || "");
          setPortfolioUrl(profile.portfolio_url || "");
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUserData();
  }, [router]);

  // ==========================================
  // 3. DARK MODE SYNCHRONIZATION
  // ==========================================
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // ==========================================
  // 4. LOG OUT HANDLER
  // ==========================================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ==========================================
  // 5. SAVE HANDLER
  // ==========================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }

      if (activeTab === "account" && newPassword) {
        if (!oldPassword) {
          setStatusMessage({ type: "error", text: "Please enter your current (old) password." });
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setStatusMessage({ type: "error", text: "New password and confirmation do not match." });
          setLoading(false);
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: session.user.email!,
          password: oldPassword,
        });

        if (signInError) {
          setStatusMessage({ type: "error", text: "Current password is incorrect." });
          setLoading(false);
          return;
        }

        const { error: updatePasswordError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updatePasswordError) throw updatePasswordError;

        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setStatusMessage({ type: "success", text: "Password updated successfully!" });
        setLoading(false);
        return;
      }

      if (activeTab === "profile") {
        // FIX: Removed 'phone' from the upsert query.
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: session.user.id,
            full_name: fullName,
            location: location,
            country: country,
            bio: bio,
            portfolio_url: portfolioUrl,
            updated_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        setStatusMessage({ type: "success", text: "Profile details updated successfully!" });
      } else {
        setStatusMessage({ type: "success", text: "Preferences saved successfully!" });
      }

    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: err.message || "An error occurred while saving." });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-900 p-8 animate-pulse flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-[#f7f9fc] text-slate-900"}`}>
      
      {/* Top Header Navigation */}
      <header className={`sticky top-0 z-20 flex h-16 items-center justify-between border-b px-6 lg:px-12 transition-colors ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="font-bold text-lg">Account Settings</span>
        </div>
        
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer"
        >
          Return to Dashboard
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold sm:text-3xl">Settings & Preferences</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your public profile details, account credentials, notifications, and app theme.
          </p>
        </div>

        {statusMessage && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
            statusMessage.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
          }`}>
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="text-xs underline font-semibold ml-2">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: "profile", label: "Profile" },
              { id: "account", label: "Account" },
              { id: "notifications", label: "Notifications" },
              { id: "appearance", label: "Appearance" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setStatusMessage(null);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className={`md:col-span-3 rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
            <form onSubmit={handleSave} className="space-y-6">

              {activeTab === "profile" && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold">Public Profile</h2>
                  {/* FIX: Added dark:text-white so the text is visible when typing in dark mode */}
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="Your full name"
                  />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="City / Location"
                  />
                </div>
              )}

              {activeTab === "account" && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold">Account Security</h2>
                  
                  <div className="pt-4 space-y-3 border-t border-slate-100 dark:border-slate-700">
                    <a
                      href="mailto:support@vouch.app"
                      className="block w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
                    >
                      Contact Support (support@vouch.app)
                    </a>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition shadow-sm"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold">Appearance Settings</h2>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <span>Dark Mode</span>
                    <button
                      type="button"
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${darkMode ? "bg-blue-600" : "bg-slate-300"}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${darkMode ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition"
                >
                  {loading ? "Saving..." : "Save Settings"}
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>
    </div>
  );
}