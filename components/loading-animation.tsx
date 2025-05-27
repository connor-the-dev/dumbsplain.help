'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export const LoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isHiding, setIsHiding] = useState(false)
  
  useEffect(() => {
    // Start hiding animation after 2 seconds
    const timer = setTimeout(() => {
      setIsHiding(true)
      
      // Remove component after animation completes
      const removeTimer = setTimeout(() => {
        setIsLoading(false)
      }, 500) // Match fadeOut animation duration
      
      return () => clearTimeout(removeTimer)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!isLoading) return null
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center animate-gradient ${isHiding ? 'animate-fade-out' : 'animate-fade-in'}`}
      style={{
        background: 'linear-gradient(-45deg, #0f172a, #020617, #1e293b, #0f172a)',
        backgroundSize: '400% 400%',
      }}
    >
      <div className="flex flex-col items-center">
        <div className="relative animate-spin mb-4">
          <div className="animate-pulse-slow">
            <div className="relative z-10">
              <Image
                src="/brain-logo.svg"
                alt="Brain Logo"
                width={80}
                height={80}
                priority
              />
            </div>
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 rounded-full" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white animate-pulse-slow">dumbsplain.help</h1>
        <p className="text-gray-400 mt-2">Understand anything</p>
      </div>
    </div>
  )
} 