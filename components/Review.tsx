"use client";
// 'use client' is required because this component uses React state (useState, useEffect) 
// to track which checkboxes the user clicks and to handle asynchronous data updates.

import { useState, useEffect } from "react";
// We import the shared UI pieces from your teammate's ui.tsx file.
import { Button, Icon, PageTitle } from "./ui";
import Link from "next/link";

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================

// This defines the exact shape of an AI-suggested skill.
export type SuggestedSkill = {
  name: string;  // e.g., "Customer service"
  quote: string; // A short snippet from the user's text that proves they have this skill.
};

// These are the props (inputs) the parent page will pass into this component.
type ReviewProps = {
  experienceText: string; // The original text the user typed into the Hustle form
  suggestions: SuggestedSkill[]; // The array of skills the AI found
  onConfirm: (selectedNames: string[]) => Promise<void> | void; // The function to save to Supabase
  backHref?: string; // Where the "Back" button goes (defaults to /hustle)
  profileHref?: string; // Where the "View Profile" button goes (defaults to /profile)
  homeHref?: string; // Where the "Back to Home" button goes (defaults to /dashboard)
  errorMessage?: string; // If saving fails (e.g., database error), the parent page passes an error message here
};

// ==========================================
// 2. THE COMPONENT
// ==========================================
export default function Review({
  experienceText,
  suggestions,
  onConfirm,
  backHref = "/hustle",
  profileHref = "/profile",
  homeHref = "/dashboard",
  errorMessage,
}: ReviewProps) {
  
  // --- STATE ---
  // 'selected' is an array of skill names that the user has currently checked.
  const [selected, setSelected] = useState<string[]>([]);
  
  // 'saved' tracks whether the user has successfully saved these skills to the database.
  // If true, we show a success screen instead of the checkboxes.
  const [saved, setSaved] = useState(false);
  
  // 'busy' tracks if we are currently waiting for Supabase to save the data.
  const [busy, setBusy] = useState(false);

  // --- EFFECTS ---

  // FIX: Auto-select all skills when the component loads or when the AI results arrive.
  // This prevents the glitch where the page renders before the data is fully passed in.
  useEffect(() => {
    if (suggestions.length > 0) {
      setSelected(suggestions.map((s) => s.name));
    }
  }, [suggestions]);

  // --- FUNCTIONS ---

  // This runs when the user clicks the big "Confirm X skills" button.
  async function confirm() {
    setBusy(true); // Disable the button and show "Saving..."
    try {
      // We call the function passed down from the parent page (app/review/page.tsx)
      await onConfirm(selected); 
      setSaved(true); // If it succeeds, switch to the Success Screen
    } finally {
      setBusy(false); // Stop the loading spinner
    }
  }

  // This runs when the user clicks a skill row to check or uncheck it.
  function toggle(name: string) {
    setSelected((currentSelected) => {
      // If the skill is already in the array, REMOVE it (uncheck).
      if (currentSelected.includes(name)) {
        return currentSelected.filter((item) => item !== name);
      } 
      // If it's not in the array, ADD it (check).
      else {
        return [...currentSelected, name];
      }
    });
  }

  // ==========================================
  // VIEW 1: SUCCESS SCREEN
  // ==========================================
  // If 'saved' is true, we return this UI instead of the checkboxes.
  if (saved) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-xl place-items-center px-5">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {/* Green checkmark icon */}
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <Icon name="check" size={32} />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-950">Skills added to your profile</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            You confirmed {selected.length} self-reported {selected.length === 1 ? "skill" : "skills"} from this experience.
          </p>
          
          {/* Links to move forward */}
          <Button className="mt-7 w-full" href={profileHref} icon="arrow">
            View my profile
          </Button>
          <Button className="mt-2 w-full" href={homeHref} kind="ghost">
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE AI SUGGESTIONS SCREEN
  // ==========================================
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8">
      
      {/* Back button to return to the Hustle page */}
      <Link className="mb-6 flex items-center gap-1 text-sm font-bold text-slate-500" href={backHref}>
        <Icon name="back" size={18} />
        Back
      </Link>
      
      {/* Page Title */}
      <PageTitle
        eyebrow="AI-ASSISTED"
        text="Choose the ones that feel true to your experience. You’re always in control."
        title={
          suggestions.length === 0 
            ? "We could not find skills" 
            : `We found ${suggestions.length} ${suggestions.length === 1 ? "skill" : "skills"}`
        }
      />
      
      {/* The original text the user typed, shown so they remember what they wrote */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">FROM YOUR EXPERIENCE</p>
        <p className="mt-2 text-sm italic leading-6 text-slate-600">“{experienceText}”</p>
      </div>

      {/* The list of suggested skills */}
      <div className="mt-5 space-y-3">
        {/* We loop through every skill the AI suggested */}
        {suggestions.map((s, index) => {
          
          // Check if this specific skill is in the 'selected' array
          const active = selected.includes(s.name);
          
          return (
            <div
              aria-checked={active} // Accessibility: tells screen readers it's checked
              // Tailwind: If active, give it a blue border and light blue background. If inactive, fade it out.
              className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition ${
                active ? "border-blue-300 bg-blue-50/60" : "border-slate-200 bg-white opacity-60"
              }`}
              // Added index to the key just in case the AI returns the exact same skill name twice
              key={`${s.name}-${index}`}
              onClick={() => toggle(s.name)} // Toggle when the row is clicked
              onKeyDown={(e) => {
                // Accessibility: Allow toggling with the Space or Enter key
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(s.name);
                }
              }}
              role="checkbox"
              tabIndex={0} // Makes the div focusable via keyboard
            >
              
              {/* The visual checkbox square */}
              <span className={`grid h-6 w-6 place-items-center rounded-md border ${
                active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"
              }`}>
                {active && <Icon name="check" size={15} />}
              </span>
              
              {/* The Skill Name and Quote */}
              <span className="flex-1">
                <span className="block text-sm font-extrabold text-slate-900">{s.name}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{s.quote}</span>
              </span>
              
              {/* Edit button (Future feature) */}
              <button 
                aria-label={`Edit ${s.name}`} 
                className="text-slate-400" 
                onClick={(e) => {
                  e.stopPropagation(); // PREVENTS the row click from toggling the checkbox when trying to edit
                  // Logic to edit the skill name would go here later
                }} 
                type="button"
              >
                <Icon name="edit" size={17} />
              </button>
            </div>
          );
        })}
      </div>

      {/* FIX: Show an error message ONLY if saving to the database failed AND there are no skills */}
      {errorMessage && suggestions.length === 0 && (
        <p className="mt-4 text-sm font-bold text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      {/* ==========================================
          BOTTOM ACTION BAR
          ========================================== */}
      {/* ONLY show the Confirm button if the AI actually found skills. */}
      {suggestions.length > 0 ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">Skills are labelled self-reported until verified.</p>
          
          <Button 
            className="sm:px-8" 
            disabled={busy || selected.length === 0} // Disabled if saving, or if the user unchecked everything
            onClick={confirm}
          >
            {busy ? "Saving..." : `Confirm ${selected.length} ${selected.length === 1 ? "skill" : "skills"}`}
          </Button>
        </div>
      ) : (
        // If there are 0 skills (AI failed or found nothing), show a calm "Go Back" button instead
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">Try adding a bit more detail to your description next time.</p>
          <Button className="sm:px-8" href={backHref} kind="secondary">
            Go Back
          </Button>
        </div>
      )}
    </div>
  );
}