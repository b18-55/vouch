// ==========================================
// API ROUTE: /api/extract
// ==========================================
// This file runs ONLY on the server (backend). 
// It is completely hidden from the user's browser.
// This is where we safely use the GEMINI_API_KEY.

import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

// Initialize the AI client using the secret key from our .env.local file.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// ==========================================
// HELPER FUNCTION: Sleep (Delay)
// ==========================================
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ==========================================
// HELPER FUNCTION: Safely extract error details
// ==========================================
// Because we can't use 'any', we use 'unknown' and safely check
// if the error is an object with a 'status' and 'message' property.
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
async function generateContentWithRetry(prompt: string) {
  const models = ['gemini-3.8-flash', 'gemini-3.5-flash']
  const maxRetriesPerModel = 1
  
  // We use 'unknown' here instead of 'any' to satisfy TypeScript
  let lastError: unknown = null

  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json', 
          }
        })
        return response
        
      } catch (error: unknown) {
        lastError = error
        
        // Use our helper to safely extract the status and message
        const { status, message } = getErrorDetails(error)
        
        // Check if it's a 503 (overloaded) or 429 (rate limit)
        const isRetryable = status === 503 || status === 429
        
        // If it's a bad request (e.g. 400), retrying won't help
        if (!isRetryable) {
          throw error
        }

        if (attempt === maxRetriesPerModel) {
          console.warn(`Model ${model} failed after ${maxRetriesPerModel} attempts. Switching model...`)
          break 
        }

        // EXPONENTIAL BACKOFF: Wait 2s, then 4s, then 8s
        const delay = Math.pow(2, attempt) * 1000
        console.warn(`Model ${model} is busy (attempt ${attempt}). Retrying in ${delay / 1000}s...`)
        await sleep(delay)
      }
    }
  }

  throw lastError
}

// ==========================================
// MAIN API HANDLER
// ==========================================
export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const prompt = `
      You are an expert career assistant. Extract a list of skills from this informal work experience.
      Return ONLY a valid JSON array. No markdown, no extra text.
      
      Format required:
      [
        { "name": "Skill Name", "quote": "Short quote from the text that proves this" }
      ]
      
      Experience text: "${text}"
    `

    const response = await generateContentWithRetry(prompt)

    let resultText = response.text || '[]'

    // Clean up markdown block quotes if the AI adds them
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim()

    const skills = JSON.parse(resultText)

    return NextResponse.json({ skills })

  } catch (error: unknown) {
    // Use our helper here too
    const { message } = getErrorDetails(error)
    console.error('AI Error Details:', message)
    
    return NextResponse.json({ error: 'Failed to extract skills' }, { status: 500 })
  }
}