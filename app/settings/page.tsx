"use client";
// 'use client' is required because we use React state (useState), lifecycle events (useEffect), 
// and browser APIs (localStorage, document). It runs entirely on the client side.

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

  // --- NOTIFICATION PREFERENCES STATE ---
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  // ==========================================
  // 1. LOAD USER DATA & PREFERENCES
  // ==========================================
  useEffect(() => {
    // Check if the 'dark' class is currently on the HTML tag to set the toggle switch correctly
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    // Load notification preferences from localStorage so they persist on refresh
    const savedEmailAlerts = localStorage.getItem("vouch_email_alerts");
    const savedPushAlerts = localStorage.getItem("vouch_push_alerts");
    
    if (savedEmailAlerts !== null) setEmailAlerts(savedEmailAlerts === "true");
    if (savedPushAlerts !== null) setPushAlerts(savedPushAlerts === "true");

    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/login");
          return;
        }
        setEmail(session.user.email || "");

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
  // 2. TOGGLE FUNCTIONS
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

  const toggleEmailAlerts = () => {
    const newVal = !emailAlerts;
    setEmailAlerts(newVal);
    localStorage.setItem("vouch_email_alerts", String(newVal));
    // Dispatch custom event to tell the HeaderActions bell to update instantly
    window.dispatchEvent(new Event("notificationsUpdated")); 
  };

  const togglePushAlerts = () => {
    const newVal = !pushAlerts;
    setPushAlerts(newVal);
    localStorage.setItem("vouch_push_alerts", String(newVal));
    // Dispatch custom event to tell the HeaderActions bell to update instantly
    window.dispatchEvent(new Event("notificationsUpdated")); 
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
      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        full_name: fullName,
        location: location,
      });

      if (error) throw error;
      
      setStatusMessage({ type: "success", text: "Details saved successfully." });
      setOpenSection(null); // Close the accordion on success

      // THE ARCHITECTURAL FIX: Global State Sync via Custom Events.
      // React state is component-scoped. When we update the user's name here, 
      // the Sidebar and Dashboard components are completely unaware of it.
      // Instead of prop-drilling or adding a heavy state management library (like Redux), 
      // we dispatch a lightweight custom DOM event. 
      // The Sidebar and Dashboard have event listeners setup that listen for this 
      // specific string. When they hear it, they trigger their own database fetches 
      // to recalculate the Profile Strength percentage instantly.
      window.dispatchEvent(new Event('vouch-data-updated'));

    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 5. UPDATE PASSWORD
  // ==========================================
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPassword(true);
    setPasswordMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
      setNewPassword(""); 
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
          </div>
        </div>
      </div>
    );
  }

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

            {/* SECTION 2: Notifications */}
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
                <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-bold text-slate-700 dark:text-slate-300">Email Updates</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Receive weekly gig matches.</span>
                    </div>
                    <button type="button" onClick={toggleEmailAlerts} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${emailAlerts ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${emailAlerts ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="block text-sm font-bold text-slate-700 dark:text-slate-300">Gig Matches</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">Get notified when a task matches your skills.</span>
                    </div>
                    <button type="button" onClick={togglePushAlerts} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${pushAlerts ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${pushAlerts ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Appearance */}
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

            {/* SECTION 4: Privacy & Security */}
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
                  
                  <form onSubmit={handlePasswordUpdate} className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Change Password</p>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Enter new password (min 8 chars)" 
                      required
                      minLength={8}
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

        {/* HELP & ABOUT SECTION */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          
          <div>
            <button onClick={() => setOpenSection(openSection === "help" ? null : "help")} className="flex w-full items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Icon name="arrow" size={18} /> Help centre
              </div>
              <span className={`text-slate-400 transition-transform duration-200 ${openSection === "help" ? "rotate-90" : ""}`}>
                <Icon name="chevron" size={16} />
              </span>
            </button>
            
            {openSection === "help" && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Need help with Vouch? We're here for you.
                </p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc pl-5 space-y-1">
                  <li>Email us at <span className="font-bold text-blue-600 dark:text-blue-400">support@vouch.app</span></li>
                  <li>Read our FAQ on the main website</li>
                  <li>Report a bug directly from the app</li>
                </ul>
              </div>
            )}
          </div>
          
          <div>
            <button onClick={() => setOpenSection(openSection === "about" ? null : "about")} className="flex w-full items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                <Icon name="briefcase" size={18} /> About Vouch
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">v0.9.0</span>
                <span className={`text-slate-400 transition-transform duration-200 ${openSection === "about" ? "rotate-90" : ""}`}>
                  <Icon name="chevron" size={16} />
                </span>
              </div>
            </button>

            {openSection === "about" && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>
                  Vouch is a micro-internship and skills-verification platform that connects young people to real income. 
                </p>
                <p className="mt-2">
                  We help you turn your informal hustle, volunteer work, and daily grind into a verified, employer-ready profile using AI skill extraction. 
                </p>
              </div>
            )}
          </div>

        </div>

        {/* LOGOUT BUTTON */}
        <button onClick={handleLogout} className="w-full py-4 text-center text-sm font-bold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-sm">
          Log out
        </button>

        <div className="pt-6 pb-2 text-center">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-600">
            Empowering informal work through verified skills.
          </p>
        </div>

      </div>
    </div>
  );
}