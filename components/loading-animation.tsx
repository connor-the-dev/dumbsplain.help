'use client'

import { useEffect, useState } from 'react'

export const LoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    // Define the typing sequence with precise timing
    const sequence = [
      { text: '', delay: 300 }, // Initial delay
      { text: 'd', delay: 80 },
      { text: 'du', delay: 60 },
      { text: 'dum', delay: 70 },
      { text: 'dumb', delay: 65 },
      { text: 'dumbs', delay: 75 },
      { text: 'dumbsp', delay: 80 },
      { text: 'dumbspl', delay: 85 },
      { text: 'dumbspla', delay: 90 },
      { text: 'dumbsplai', delay: 95 }, // Start typo
      { text: 'dumbsplain', delay: 100 }, // Typo: "ain" instead of "ai"
      { text: 'dumbsplaine', delay: 120 }, // Complete typo
      { text: 'dumbsplaine', delay: 500 }, // Pause - realize mistake
      { text: 'dumbsplain', delay: 80 }, // Backspace one
      { text: 'dumbspla', delay: 60 }, // Backspace more
      { text: 'dumbsplai', delay: 90 }, // Retype correctly
      { text: 'dumbsplain', delay: 100 },
      { text: 'dumbsplain.', delay: 150 },
      { text: 'dumbsplain.h', delay: 80 },
      { text: 'dumbsplain.he', delay: 70 },
      { text: 'dumbsplain.hel', delay: 75 },
      { text: 'dumbsplain.help', delay: 80 },
      { text: 'dumbsplain.help', delay: 800 }, // Final pause
    ]

    let currentStep = 0
    let timeoutId: NodeJS.Timeout

    const executeStep = () => {
      if (currentStep >= sequence.length) {
        // Animation complete, start fade out
        setIsLoading(false)
        // Remove component completely after fade animation
        setTimeout(() => setShouldRender(false), 500)
        return
      }

      const step = sequence[currentStep]
      setDisplayText(step.text)
      currentStep++

      timeoutId = setTimeout(executeStep, step.delay)
    }

    // Start the animation
    executeStep()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  // Smoother cursor blinking
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530) // Slightly different timing for more natural feel

    return () => clearInterval(cursorInterval)
  }, [])

  if (!shouldRender) {
    return null
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-950 transition-opacity duration-500 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ pointerEvents: isLoading ? 'auto' : 'none' }}
    >
      <div className="flex flex-col items-center">
        <div className="text-3xl font-bold font-poppins min-h-[1.2em] flex items-center">
          <span className="bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 text-transparent bg-clip-text animate-gradient bg-[length:200%_auto]">
            {displayText}
          </span>
          <span 
            className={`ml-0.5 w-0.5 h-8 bg-blue-400 transition-opacity duration-75 ${showCursor ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
        <p className="text-gray-300 mt-4 text-sm font-semibold bg-gradient-to-r from-white via-gray-300 to-white bg-[length:200%_auto] text-transparent bg-clip-text animate-gradient">Understand everything</p>
      </div>
    </div>
  )
} 