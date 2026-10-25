"use client";
// 'use client' is required because we use React state to handle forms and modals.

import { useState } from "react";
import { Button, Field, Icon, PageTitle } from "./ui";

// ==========================================
// 1. TYPESCRIPT TYPES
// ==========================================
export type ExperienceItem = {
  id: string;
  title: string;
  date: string; 
  text: string;
  skills: string[]; 
  evidence_url?: string | null; // NEW: Added to support verification links
};

export type ExperienceInput = {
  title: string;
  description: string; 
  // We added "Job training" and "Student practicals" to the allowed types
  type: "Informal work" | "Volunteering" | "Side hustle" | "Community work" | "Job training" | "Student practicals";
  evidence_url?: string; // NEW: Added to support verification links
};

type HustleProps = {
  experiences: ExperienceItem[]; 
  onSave: (input: ExperienceInput) => Promise<void> | void; 
  onDelete?: (id: string) => Promise<void> | void; 
  onEdit?: (id: string, newDescription: string) => Promise<void> | void; 
  saving?: boolean; 
  errorMessage?: string; 
};

const MAX = 1000;

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function Hustle({ experiences, onSave, onDelete, onEdit, saving = false, errorMessage }: HustleProps) {
  
  const [form, setForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ExperienceInput["type"]>("Informal work");
  
  // NEW: State to hold the evidence/proof URL
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // ==========================================
  // VALIDATION
  // ==========================================
  // The "Save" button is disabled if the title is empty, the description is 
  // too short, or if it is currently saving to the database.
  // We enforce > 20 characters because if a user types only 2 words, 
  // the AI won't have enough context to extract meaningful skills.
  const canSave = title.trim().length > 0 && description.trim().length > 20 && !saving;

  // ==========================================
  // VIEW 1: THE FORM
  // ==========================================
  if (form) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8">
        <button className="mb-6 flex items-center gap-1 text-sm font-bold text-slate-500 dark:text-slate-400" onClick={() => setForm(false)} type="button">
          <Icon name="back" size={18} />
          Back to my hustle
        </button>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-9 transition-colors">
          
          {/* Header row with the Magic Demo button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="icon-tile bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Icon name="spark" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Log an experience</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Any work counts—paid, unpaid or helping out.</p>
              </div>
            </div>
            
            {/* NEW: Hackathon Magic Button */}
            <button
              type="button"
              onClick={() => {
                setTitle("Weekend Shop Assistant");
                setDescription("I worked at my aunt's spaza shop over the weekend. I helped customers find what they needed, rang up their purchases on the till, and handled the cash.");
                setType("Informal work");
                setEvidenceUrl("https://drive.google.com/demo-portfolio");
              }}
              className="shrink-0 text-xs font-bold text-blue-600 hover:underline px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg transition"
            >
              ✨ Fill Demo Data
            </button>
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
              <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">What did you do?</span>
              <textarea
                className="min-h-44 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-4 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
                maxLength={MAX}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="I helped customers find products, managed the till and counted stock at the end of each day."
                value={description}
              />
              
              {/* Live character counter and helper text */}
              <span className="mt-2 flex justify-between text-xs text-slate-400 dark:text-slate-500">
                <span>Please add at least 20 characters so our AI can find your skills.</span>
                <span>{description.length} / {MAX.toLocaleString("en-ZA")}</span>
              </span>
            </label>

            {/* Grid for Type and Evidence URL */}
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Type of experience</span>
                <select
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 text-sm outline-none focus:border-blue-500 transition"
                  onChange={(e) => setType(e.target.value as ExperienceInput["type"])}
                  value={type}
                >
                  <option>Informal work</option>
                  <option>Volunteering</option>
                  <option>Side hustle</option>
                  <option>Community work</option>
                  <option>Job training</option>
                  <option>Student practicals</option>
                </select>
              </label>

              {/* NEW: Evidence URL Input */}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200">Proof / Evidence Link (Optional)</span>
                <input
                  type="url"
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-4 text-sm outline-none focus:border-blue-500 transition"
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="e.g. Link to a Google Drive or LinkedIn"
                  value={evidenceUrl}
                />
              </label>
            </div>

            {errorMessage && (
              <p className="text-sm font-bold text-red-600 dark:text-red-400" role="alert">
                {errorMessage}
              </p>
            )}

            <Button
              className="w-full sm:w-auto sm:px-8"
              disabled={!canSave}
              icon="spark"
              // Passed evidenceUrl to the save function
              onClick={() => onSave({ title: title.trim(), description: description.trim(), type, evidence_url: evidenceUrl })}
            >
              {saving ? "Saving..." : "Save & find my skills"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: THE LIST
  // ==========================================
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
      
      <div className="mt-7 rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-5 transition-colors">
        <div className="flex gap-3">
          <span className="mt-0.5 text-blue-600 dark:text-blue-400">
            <Icon name="spark" />
          </span>
          <div>
            <p className="font-bold text-blue-950 dark:text-blue-100">Informal work is real experience</p>
            <p className="mt-1 text-sm leading-6 text-blue-800 dark:text-blue-300">
              Tutoring a neighbour, fixing phones or helping in a family shop can all show valuable skills.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {experiences.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center text-sm text-slate-500 dark:text-slate-400 transition-colors">
            You have not logged any experience yet. Tap “Log experience” to start.
          </p>
        )}

        {experiences.map((e) => (
          <ExperienceCard 
            key={e.id} 
            {...e} 
            onDelete={onDelete}
            onEditClick={(id, text) => {
              setEditingId(id);
              setEditText(text);
            }}
          />
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">Edit Experience</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update the description of your experience.</p>
            
            <textarea
              className="mt-4 min-h-32 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />

            <div className="mt-4 flex gap-3">
              <Button kind="secondary" className="flex-1" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                if (onEdit && editingId) {
                  onEdit(editingId, editText);
                }
                setEditingId(null);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. THE EXPERIENCE CARD COMPONENT
// ==========================================
function ExperienceCard({ id, date, skills, text, title, evidence_url, onDelete, onEditClick }: ExperienceItem & { onDelete?: (id: string) => void, onEditClick?: (id: string, text: string) => void }) {
  return (
    <article className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-6 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{date}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {onEditClick && (
            <button 
              onClick={() => onEditClick(id, text)}
              aria-label="Edit experience" 
              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer" 
              type="button"
            >
              <Icon name="edit" size={18} />
            </button>
          )}

          {onDelete && (
            <button 
              aria-label="Delete experience" 
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer" 
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
      
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
      
      {/* NEW: Display Evidence Link if it exists */}
      {evidence_url && (
        <div className="mt-2">
          <a href={evidence_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            <Icon name="arrow" size={12} /> View Evidence
          </a>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors" key={skill}>
            {skill}
          </span>
        ))}
      </div>
    </article>
  );
}