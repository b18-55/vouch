"use client";
// 'use client' is a Next.js directive. It tells Next.js that this component 
// runs on the browser (Client Component) and not just on the server. 

import { useState } from "react";
// We import our shared UI pieces from your teammate's ui.tsx file.
import { Button, Field, Icon, PageTitle } from "./ui";

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
export type ExperienceItem = {
  id: string;       // The unique ID from the Supabase database
  title: string;    // e.g. "Maths tutoring"
  date: string;     // Formatted date string (e.g. "18 October 2026")
  text: string;     // The description the user typed
  skills: string[]; // An array of confirmed skills
};

export type ExperienceInput = {
  title: string;
  description: string; 
  type: "Informal work" | "Volunteering" | "Side hustle" | "Community work";
};

// Added onDelete prop here as per Person 4 specifications
type HustleProps = {
  experiences: ExperienceItem[];
  onSave: (input: ExperienceInput) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void; // Person 4 Delete Action
  saving?: boolean;
  errorMessage?: string;
};

const MAX = 1000;

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function Hustle({ experiences, onSave, onDelete, saving = false, errorMessage }: HustleProps) {
  
  const [form, setForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ExperienceInput["type"]>("Informal work");

  const canSave = title.trim().length > 0 && description.trim().length > 0 && !saving;

  // VIEW 1: THE FORM
  if (form) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8">
        <button className="mb-6 flex items-center gap-1 text-sm font-bold text-slate-500" onClick={() => setForm(false)} type="button">
          <Icon name="back" size={18} />
          Back to my hustle
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9">
          <div className="flex items-center gap-4">
            <span className="icon-tile bg-blue-50 text-blue-600">
              <Icon name="spark" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-950">Log an experience</h1>
              <p className="mt-1 text-sm text-slate-500">Any work counts—paid, unpaid or helping out.</p>
            </div>
          </div>
          
          <div className="mt-8 space-y-5">
            <Field 
              label="Give it a short title" 
              maxLength={100} 
              onChange={setTitle} 
              placeholder="e.g. Helped at my uncle's shop" 
              value={title} 
            />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">What did you do?</span>
              <textarea
                className="min-h-44 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                maxLength={MAX}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="I helped customers find products, managed the till and counted stock at the end of each day."
                value={description}
              />
              <span className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Be specific. This helps us find the right skills.</span>
                <span>{description.length} / {MAX.toLocaleString("en-ZA")}</span>
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-800">Type of experience</span>
              <select
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500"
                onChange={(e) => setType(e.target.value as ExperienceInput["type"])}
                value={type}
              >
                <option>Informal work</option>
                <option>Volunteering</option>
                <option>Side hustle</option>
                <option>Community work</option>
              </select>
            </label>

            {errorMessage && (
              <p className="text-sm font-bold text-red-600" role="alert">
                {errorMessage}
              </p>
            )}

            <Button
              className="w-full sm:w-auto sm:px-8"
              disabled={!canSave}
              icon="spark"
              onClick={() => onSave({ title: title.trim(), description: description.trim(), type })}
            >
              {saving ? "Saving..." : "Save & find my skills"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: THE LIST
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
      
      <PageTitle
        action={
          <Button icon="plus" onClick={() => setForm(true)}>
            Log experience
          </Button>
        }
        text="Every experience tells a story about what you can do."
        title="My hustle"
      />
      
      <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex gap-3">
          <span className="mt-0.5 text-blue-600">
            <Icon name="spark" />
          </span>
          <div>
            <p className="font-bold text-blue-950">Informal work is real experience</p>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              Tutoring a neighbour, fixing phones or helping in a family shop can all show valuable skills.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {experiences.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            You have not logged any experience yet. Tap “Log experience” to start.
          </p>
        )}

        {/* Pass onDelete handler down to each ExperienceCard */}
        {experiences.map((e) => (
          <ExperienceCard key={e.id} {...e} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. THE EXPERIENCE CARD COMPONENT
// ==========================================
function ExperienceCard({ id, date, skills, text, title, onDelete }: ExperienceItem & { onDelete?: (id: string) => void }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs text-slate-400">{date}</p>
        </div>
        
        {/* Action icons grouping: Edit Pencil and Trash Delete button */}
        <div className="flex items-center gap-2">
          {/* Edit Icon */}
          <button aria-label="Edit experience" className="text-slate-400 hover:text-blue-600 transition cursor-pointer" type="button">
            <Icon name="edit" size={18} />
          </button>

          {/* Delete Trash Icon (Person 4 Feature) */}
          {onDelete && (
            <button 
              aria-label="Delete experience" 
              className="text-slate-400 hover:text-rose-600 transition cursor-pointer" 
              onClick={() => onDelete(id)}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <p className="mt-4 text-sm leading-6 text-slate-600">{text}</p>
      
      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600" key={skill}>
            {skill}
          </span>
        ))}
      </div>
    </article>
  );
}