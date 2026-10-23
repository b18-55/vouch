# Vouch
**Verified skills. Real income.**

Vouch is a skills-verification and micro-internship platform that turns informal hustle into credible, employer-trusted experience. Built as a low-data Progressive Web App (PWA) for the FNB App of the Year Hackathon 2026.

## 🚀 The Problem
Youth unemployment in Southern Africa is at crisis levels. The root cause is the "experience trap"—youth cannot get jobs without experience, and cannot gain experience without being hired. Meanwhile, their informal work leaves no verifiable record, and they face massive data barriers when trying to access traditional job portals.

## 💡 The Solution
Vouch turns informal hustle into verified skills using AI, and matches youth to paid micro-internships.
*   **Hustle Logging:** Capture informal work in plain text.
*   **AI Skill Extraction:** Powered by Groq.
*   **Human-in-the-Loop:** Youth must confirm AI-generated skills.
*   **Micro-internships:** Paid 1–5 day tasks.

## 🛠 Tech Stack
*   **Frontend:** Next.js, React, Tailwind CSS
*   **Backend & Database:** Supabase (PostgreSQL, Row Level Security)
*   **AI:** Groq API
*   **Deployment:** Vercel

## 🔒 Security
Built using Secure by Design principles. Features include Row Level Security (RLS), parameterized queries to prevent SQL injection, and zero hardcoded secrets. See our SSDLC document for full details.

## 🏃‍♂️ How to Run Locally
1. Clone the repo
2. Run `npm install`
3. Create a `.env.local` file with your Supabase and Groq keys.
4. Run `npm run dev`

**Live Demo:** [https://vouch-nine-kappa.vercel.app/](https://vouch-nine-kappa.vercel.app/)
**Demo Account:** `judge@vouch.app` / `password123`