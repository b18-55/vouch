// ==========================================
// API ROUTE: /api/extract
// ==========================================
// This file is a "Serverless Function". It does NOT run in the user's browser.
// It runs securely on Vercel's servers. This is why we can safely use our 
// secret API key here without exposing it to hackers.

import { NextResponse } from 'next/server'
// NextResponse lets us send JSON data back to the frontend along with 
// HTTP status codes (like 200 OK, 400 Bad Request, or 500 Server Error).

import { GoogleGenAI } from '@google/genai'
// The official Google SDK for talking to the Gemini AI models.

// ==========================================
// 1. VERCEL TIMEOUT CONFIGURATION
// ==========================================
// Vercel has a default timeout for serverless functions (usually 10 seconds).
// If Google's AI takes longer than that to reply, Vercel will kill the request 
// and show an error to the user. This line tells Vercel to allow this specific 
// function to run for up to 60 seconds.
export const maxDuration = 60; 

// ==========================================
// 2. INITIALIZATION
// ==========================================
// We initialize the AI client using the secret key from our .env.local file.
// On Vercel, this will read from the Environment Variables we set up in the dashboard.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// ==========================================
// HELPER FUNCTION: Sleep (Delay)
// ==========================================
// This is a simple utility function to pause the code for a certain number 
// of milliseconds. We use this for "exponential backoff" (waiting before retrying).
// 1000 milliseconds = 1 second.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ==========================================
// HELPER FUNCTION: Extract Error Details
// ==========================================
// TypeScript is strict. When an error happens, it doesn't know what shape 
// the error object is (it could be a string, an object, etc.). 
// This function safely checks if the error is an object and extracts the 
// 'status' and 'message' properties without crashing.
function getErrorDetails(error: unknown) {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>
    return {
      status: typeof err.status === 'number' ? err.status : (typeof err.code === 'number' ? err.code : null),
      message: typeof err.message === 'string' ? err.message : 'Unknown error occurred'
    }
  }
  return { status: null, message: String(error) }
}

// ==========================================
// HELPER FUNCTION: AI Generation with Retry
// ==========================================
// Google's AI servers sometimes get overwhelmed and return a "503 Service Unavailable" 
// or "429 Too Many Requests" error. Instead of failing, this function will 
// automatically wait, retry, and even switch to a backup AI model.
async function generateContentWithRetry(prompt: string) {
  
  // We try the best model first (3.8-flash). If it's completely down, 
  // we fall back to the older, more stable model (3.5-flash).
  const models = ['gemini-3.8-flash', 'gemini-3.5-flash']
  
  // We will try each model up to 3 times before giving up on it.
  const maxRetriesPerModel = 3
  
  // This stores the error if all attempts fail, so we can show it at the end.
  let lastError: unknown = null

  // 1. Loop through each model
  for (const model of models) {
    
    // 2. For the current model, try up to 3 times
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        // Attempt to generate content from Google
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            // This forces the AI to reply in pure JSON, not conversational text.
            responseMimeType: 'application/json', 
          }
        })
        
        // If we reach this line, it succeeded! Return the response and exit the function.
        return response
        
      } catch (error: unknown) {
        lastError = error
        const { status } = getErrorDetails(error)
        
        // Check if the error is temporary. 
        // 503 = Server Overloaded. 429 = Rate Limit Exceeded.
        const isRetryable = status === 503 || status === 429
        
        // If it's a 400 (Bad Request) or 401 (Unauthorized), retrying won't help.
        // It means our code or API key is wrong. We throw the error immediately.
        if (!isRetryable) {
          throw error
        }

        // If we have already tried 3 times for this model, stop and move to the next model.
        if (attempt === maxRetriesPerModel) {
          console.warn(`Model ${model} failed after ${maxRetriesPerModel} attempts. Switching model...`)
          break 
        }

        // EXPONENTIAL BACKOFF:
        // Attempt 1 fails -> wait 2 seconds.
        // Attempt 2 fails -> wait 4 seconds.
        // Attempt 3 fails -> wait 8 seconds.
        const delay = Math.pow(2, attempt) * 1000
        console.warn(`Model ${model} is busy (attempt ${attempt}). Retrying in ${delay / 1000}s...`)
        
        // Pause the code before trying again
        await sleep(delay)
      }
    }
  }

  // If we get here, it means all models and all retries failed. Throw the final error.
  throw lastError
}

// ==========================================
// MAIN API HANDLER (POST Request)
// ==========================================
// The frontend calls this function by sending a POST request to /api/extract
export async function POST(req: Request) {
  try {
    // 1. Parse the incoming JSON body from the frontend.
    // The frontend sends: { text: "I baked cupcakes..." }
    const { text } = await req.json()

    // 2. Basic validation. If they didn't send any text, stop immediately.
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // 3. Construct the prompt for the AI.
    // We give it strict instructions and an exact JSON format to follow.
    const prompt = `
      You are an expert career assistant. Extract a list of skills from this informal work experience.
      Return ONLY a valid JSON array. No markdown, no extra text.
      
      Format required:
      [
        { "name": "Skill Name", "quote": "Short quote from the text that proves this" }
      ]
      
      Experience text: "${text}"
    `

    // 4. Call the AI (using our robust retry function)
    const response = await generateContentWithRetry(prompt)

    // 5. Extract the text from the AI's response. 
    // We default to '[]' (an empty array) if for some reason it's null.
    let resultText = response.text || '[]'

    // 6. Clean the text.
    // Even when told not to, AI models sometimes wrap JSON in markdown backticks:
    // ```json
    // [ { "name": "Baking" } ]
    // ```
    // This regex removes the backticks so JSON.parse doesn't crash.
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim()

    // 7. Convert the cleaned string into a real JavaScript array of objects.
    const skills = JSON.parse(resultText)

    // 8. Send the final skills back to the frontend as JSON!
    return NextResponse.json({ skills })

  } catch (error: unknown) {
    // If ANYTHING fails (network error, Google is down, malformed JSON), we land here.
    
    // We extract the error message for our server logs.
    const { message } = getErrorDetails(error)
    console.error('AI Error Details:', message)
    
    // We send a generic 500 error back to the frontend. 
    // (We don't send the raw error to the user because it might expose server details).
    return NextResponse.json({ error: 'Failed to extract skills' }, { status: 500 })
  }
}