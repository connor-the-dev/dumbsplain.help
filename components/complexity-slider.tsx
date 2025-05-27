"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ComplexitySliderProps {
  value: number
  onChange: (value: number) => void
}

export function ComplexitySlider({ value, onChange }: ComplexitySliderProps) {
  const handleChange = (newValue: number[]) => {
    onChange(newValue[0])
  }

  const getComplexityLabel = (value: number) => {
    if (value < 20) return "5-year-old"
    if (value < 40) return "Elementary"
    if (value < 60) return "Middle School"
    if (value < 80) return "High School"
    return "Expert"
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-300">Explanation Complexity:</p>
        <motion.span 
          className="text-sm font-medium px-3 py-1 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: `linear-gradient(
              to right,
              ${value < 33 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.2)'}, 
              ${value >= 33 && value < 66 ? 'rgba(234, 179, 8, 0.8)' : 'rgba(234, 179, 8, 0.2)'},
              ${value >= 66 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.2)'}
            )`,
            color: 'white'
          }}
        >
          {getComplexityLabel(value)}
        </motion.span>
      </div>
      <div className="relative pt-1">
        <div 
          className="absolute w-full h-2 rounded-xl overflow-hidden" 
          style={{
            background: 'linear-gradient(to right, #EF4444, #EAB308, #3B82F6)'
          }}
        />
        <SliderPrimitive.Root
          className="relative flex w-full touch-none select-none items-center h-5"
          defaultValue={[value]}
          value={[value]}
          max={100}
          step={1}
          onValueChange={handleChange}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow rounded-xl bg-transparent">
            <SliderPrimitive.Range className="absolute h-full bg-transparent" />
          </SliderPrimitive.Track>
          <motion.div
            className="absolute -top-1 -translate-x-1/2 z-10"
            style={{ left: `${value}%` }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-white bg-white ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-lg hover:shadow-xl hover:shadow-white/50 cursor-pointer" />
          </motion.div>
        </SliderPrimitive.Root>
      </div>
      <div className="flex justify-between text-xs text-gray-400 px-1">
        <span>Simple</span>
        <span>Advanced</span>
      </div>
    </div>
  )
} 