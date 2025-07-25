"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type LengthOption = "short" | "medium" | "long"

interface LengthSelectorProps {
  value: LengthOption
  onChange: (value: LengthOption) => void
  compact?: boolean
}

export function LengthSelector({ value, onChange, compact = false }: LengthSelectorProps) {
  const options: { value: LengthOption; label: string; description: string }[] = [
    { value: "short", label: "Short", description: "100-200 words" },
    { value: "medium", label: "Medium", description: "300-400 words" },
    { value: "long", label: "Long", description: "500-600 words" },
  ]

  if (compact) {
    return (
      <div className="flex gap-1">
        {options.map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onChange(option.value)
            }}
            className={cn(
              "relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
              value === option.value
                ? "border-transparent text-gray-900 shadow-md"
                : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300",
            )}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {value === option.value && (
              <motion.div
                layoutId="compactActivePill"
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor:
                    option.value === "short" ? "#EF4444" : option.value === "medium" ? "#3B82F6" : "#EAB308",
                }}
                initial={false}
                transition={{ type: "spring", duration: 0.3 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-300">Explanation Length:</p>
      <div className="flex gap-2">
        {options.map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onChange(option.value)
            }}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
              value === option.value
                ? "border-transparent text-gray-900 shadow-lg scale-105"
                : "border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 hover:shadow-md hover:bg-gray-800/50",
            )}
            whileHover={value !== option.value ? { scale: 1.05, y: -2 } : {}}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {value === option.value && (
              <motion.div
                layoutId="activePill"
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor:
                    option.value === "short" ? "#EF4444" : option.value === "medium" ? "#3B82F6" : "#EAB308",
                }}
                initial={false}
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center">
              <span>{option.label}</span>
              <span className="text-xs opacity-80">{option.description}</span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
