"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface ExplanationDisplayProps {
  explanation: string
  isLoading: boolean
  question: string
}

export function ExplanationDisplay({ explanation, isLoading, question }: ExplanationDisplayProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  // Reset animation when explanation changes
  useEffect(() => {
    setDisplayedText("")
    setCurrentIndex(0)
  }, [explanation])

  // Animate text typing effect
  useEffect(() => {
    if (isLoading || !explanation) return

    const timer = setTimeout(() => {
      if (currentIndex < explanation.length) {
        // Get the next chunk of text (word by word)
        const nextSpace = explanation.indexOf(" ", currentIndex)
        const nextNewline = explanation.indexOf("\n", currentIndex)
        let nextIndex = Math.min(
          nextSpace === -1 ? explanation.length : nextSpace,
          nextNewline === -1 ? explanation.length : nextNewline
        )
        
        // If we're at the end of a word, include the space or newline
        if (nextIndex < explanation.length) {
          nextIndex++
        }
        
        setDisplayedText(explanation.substring(0, nextIndex))
        setCurrentIndex(nextIndex)
      }
    }, 30) // Slightly faster typing speed

    return () => clearTimeout(timer)
  }, [currentIndex, explanation, isLoading])

  // Split text into paragraphs
  const paragraphs = displayedText.split("\n\n").filter((p) => p.trim())

  return (
    <motion.div
      className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4 text-blue-400">{isLoading ? "Thinking..." : question}</h2>

      <div className="relative min-h-[100px]">
        {isLoading ? (
          <LoadingAnimation />
        ) : (
          <div className="prose prose-invert max-w-none">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-200 leading-relaxed">
                {paragraph}
                {index === paragraphs.length - 1 && currentIndex < explanation.length && (
                  <span className="inline-block w-2 h-5 bg-blue-400 animate-pulse ml-1"></span>
                )}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center h-24">
      <div className="flex space-x-2">
        {["bg-red-400", "bg-blue-400", "bg-yellow-400"].map((color, i) => (
          <motion.div
            key={i}
            className={`w-4 h-4 rounded-full ${color}`}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
