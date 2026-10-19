// Import the Link component from Next.js.
// We use <Link> instead of <a> because it enables client-side routing,
// meaning the page won't fully reload when the user clicks the buttons.
import Link from 'next/link'

/**
 * Landing Page.
 * This is the first thing users see when they visit the root URL (/).
 * It acts as a gateway to the Signup and Login pages.
 */
export default function Home() {
  return (
    // Outer container: 
    // min-h-screen = takes full screen height
    // flex items-center justify-center = perfectly centers the content
    // bg-gradient-to-b = creates a nice blue-to-white background fade
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      
      {/* Inner container to constrain the width of the text and buttons */}
      <div className="max-w-lg text-center">
        
        {/* App Title */}
        <h1 className="text-6xl font-bold mb-4 text-blue-600 tracking-tight">
          Vouch
        </h1>
        
        {/* Main Tagline */}
        <p className="text-2xl text-gray-900 font-semibold mb-2">
          Verified skills. Real income.
        </p>
        
        {/* Sub-text explaining the value proposition */}
        <p className="text-gray-600 mb-10">
          Turn your hustle into a verified profile employers can trust.
        </p>

        {/* Action Buttons Container */}
        <div className="flex flex-col gap-3">
          
          {/* Primary Action: Go to Signup */}
          <Link
            href="/signup"
            className="bg-blue-600 text-white p-4 rounded-lg font-semibold text-lg hover:bg-blue-700 shadow-md transition-all"
          >
            Create an account
          </Link>
          
          {/* Secondary Action: Go to Login */}
          <Link
            href="/login"
            className="border-2 border-gray-200 bg-white text-gray-700 p-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all"
          >
            Log in
          </Link>
          
        </div>
        
      </div>
    </div>
  )
}