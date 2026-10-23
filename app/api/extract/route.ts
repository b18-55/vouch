import { NextResponse } from 'next/server'
// NextResponse is a helper from Next.js that lets us send JSON data back to the frontend 
// along with HTTP status codes (like 200 OK, 400 Bad Request, or 500 Server Error).

import Groq from 'groq-sdk'
// The official Groq SDK for talking to their super-fast AI models.

import { createClient } from '@supabase/supabase-js'
// We import this so we can create a server-side Supabase client to verify the user's token.

// ==========================================
// 1. VERCEL TIMEOUT CONFIGURATION
// ==========================================
export const maxDuration = 60;

// ==========================================
// 2. INITIALIZATION
// ==========================================
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Initialize a Supabase client specifically for verifying tokens on the server.
// We use the standard public keys because we are only verifying the user, not bypassing RLS.
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ==========================================
// 3. MAIN API HANDLER (POST Request)
// ==========================================
export async function POST(req: Request) {
  try {
    // ==========================================
    // THE SECURITY FIX: Verify the user is logged in
    // ==========================================
    
    // Step A: Extract the "Authorization" header from the request sent by the frontend.
    const authHeader = req.headers.get('authorization')
    
    // If the header is missing or doesn't start with "Bearer ", reject it immediately.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 })
    }

    // Step B: Extract just the token string (removing the "Bearer " prefix).
    const token = authHeader.split(' ')[1]

    // Step C: Verify the token with Supabase.
    // This checks if the token is valid, hasn't expired, and belongs to a real user.
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    
    // If Supabase rejects the token (e.g., fake token or expired), stop immediately. 
    // DO NOT call Groq.
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 })
    }

    // ==========================================
    // IF WE GET HERE, THE USER IS AUTHENTICATED!
    // ==========================================

    // --- STEP A: Parse the incoming request ---
    const { text } = await req.json()

    // --- STEP B: Basic Validation ---
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // --- STEP C: Construct the Prompt ---
    const prompt = `
      You are an expert career assistant. Extract a list of skills from this informal work experience.
      Return ONLY a valid JSON array. No markdown, no extra text.
      
      Format required:
      [
        { "name": "Skill Name", "quote": "Short quote from the text that proves this" }
      ]
      
      Experience text: "${text}"
    `

    // --- STEP D: Call the Groq API ---
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    // --- STEP E: Extract the Response ---
    let resultText = completion.choices[0]?.message?.content || '[]'

    // --- STEP F: Clean the Text ---
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim()

    // --- STEP G: The Bulletproof Array Extractor ---
    const firstBracket = resultText.indexOf('[')
    const lastBracket = resultText.lastIndexOf(']')
    if (firstBracket !== -1 && lastBracket !== -1) {
      resultText = resultText.substring(firstBracket, lastBracket + 1)
    }

    // --- STEP H: Parse to JavaScript Object ---
    const skills = JSON.parse(resultText)

    // --- STEP I: Send Success Response ---
    return NextResponse.json({ skills })

  } catch (error: unknown) {
    // ==========================================
    // 4. ERROR HANDLING
    // ==========================================
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Groq AI Error:', errorMessage)
    return NextResponse.json({ error: 'Failed to extract skills' }, { status: 500 })
  }
}