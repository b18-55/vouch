import { NextResponse } from 'next/server'
// NextResponse is a helper from Next.js that lets us send JSON data back to the frontend 
// along with HTTP status codes (like 200 OK, 400 Bad Request, or 500 Server Error).

import Groq from 'groq-sdk'
// The official Groq SDK for talking to their super-fast AI models.

// ==========================================
// 1. VERCEL TIMEOUT CONFIGURATION
// ==========================================
// Vercel has a default timeout for serverless functions. If the AI takes too long 
// to reply, Vercel will kill the request. This tells Vercel to allow this specific 
// function to run for up to 60 seconds.
export const maxDuration = 60;

// ==========================================
// 2. INITIALIZATION
// ==========================================
// We initialize the Groq client using the secret key from our .env.local file.
// Because this file runs on the server (not the browser), this key is 100% secure.
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ==========================================
// 3. MAIN API HANDLER (POST Request)
// ==========================================
// The frontend calls this function by sending a POST request to /api/extract
export async function POST(req: Request) {
  try {
    // --- STEP A: Parse the incoming request ---
    // The frontend sends a JSON body that looks like: { text: "I baked cupcakes..." }
    const { text } = await req.json()

    // --- STEP B: Basic Validation ---
    // If the user somehow submitted an empty text box, stop immediately and send a 400 error.
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // --- STEP C: Construct the Prompt ---
    // We give the AI strict instructions on its role, the exact JSON format we want, 
    // and we inject the user's text at the end.
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
      // 'llama-3.3-70b-versatile' is Groq's flagship model. It is incredibly fast and smart.
      model: 'openai/gpt-oss-120b',
      
      // The messages array is how we talk to the AI. We pass our prompt as the user.
      messages: [{ role: 'user', content: prompt }],
      
      // This forces the AI to output pure JSON, not conversational text.
      response_format: { type: 'json_object' },
      
      // Temperature controls randomness. 0.2 means the AI will be very focused and factual.
      temperature: 0.2,
    })

    // --- STEP E: Extract the Response ---
    // Groq returns the text inside completion.choices[0].message.content.
    // We use optional chaining (?.) and a fallback ('[]') just in case it's empty.
    let resultText = completion.choices[0]?.message?.content || '[]'

    // --- STEP F: Clean the Text ---
    // Even when told not to, AI models sometimes wrap JSON in markdown backticks (```json).
    // This regex removes those backticks so the JSON.parse doesn't crash.
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim()

    // --- STEP G: The Bulletproof Array Extractor ---
    // Sometimes the AI says "Here are your skills: [ ... ]"
    // This finds the very first '[' and the very last ']' and ignores everything else.
    const firstBracket = resultText.indexOf('[')
    const lastBracket = resultText.lastIndexOf(']')
    if (firstBracket !== -1 && lastBracket !== -1) {
      resultText = resultText.substring(firstBracket, lastBracket + 1)
    }

    // --- STEP H: Parse to JavaScript Object ---
    // Convert the clean string into a real JavaScript array of objects.
    const skills = JSON.parse(resultText)

    // --- STEP I: Send Success Response ---
    // Send the final skills back to the frontend as JSON!
    return NextResponse.json({ skills })

  } catch (error: unknown) {
    // ==========================================
    // 4. ERROR HANDLING
    // ==========================================
    // We use 'unknown' instead of 'any' to satisfy TypeScript's strict rules.
    // Then we safely check if the error is an Error object to get the message.
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Log the exact error to the Vercel/Local terminal so we can debug it.
    console.error('Groq AI Error:', errorMessage)
    
    // Send a generic error message back to the frontend.
    return NextResponse.json({ error: 'Failed to extract skills' }, { status: 500 })
  }
}