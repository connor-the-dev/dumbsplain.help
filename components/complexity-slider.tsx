"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface ComplexitySliderProps {
  value: number
  onChange: (value: number) => void
  compact?: boolean
}

export function ComplexitySlider({ value, onChange, compact = false }: ComplexitySliderProps) {
  const isMobile = useIsMobile()
  const [isSliding, setIsSliding] = React.useState(false)

  const handleChange = (newValue: number[]) => {
    onChange(newValue[0])
  }

  const handlePointerDown = () => {
    setIsSliding(true)
  }

  const handlePointerUp = () => {
    setIsSliding(false)
  }

  const getComplexityLabel = (value: number) => {
    if (value < 20) return "5-year-old"
    if (value < 40) return "Elementary"
    if (value < 60) return "Middle School"
    if (value < 80) return "High School"
    return "Expert Level"
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 min-w-0">
        {!isMobile && (
          <span className="text-xs text-gray-400 whitespace-nowrap">Complexity:</span>
        )}
        <div className={cn("relative flex-1", isMobile ? "min-w-24" : "min-w-32")}>
          {/* Mobile popup - only show when sliding */}
          {isMobile && (
            <AnimatePresence>
              {isSliding && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute -top-10 left-0 z-10"
                >
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {getComplexityLabel(value)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <SliderPrimitive.Root
            className="relative flex w-full touch-none select-none items-center h-4"
            defaultValue={[value]}
            value={[value]}
            max={100}
            step={1}
            onValueChange={handleChange}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full overflow-hidden bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400">
              <SliderPrimitive.Range className="absolute h-full bg-transparent" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="block h-3 w-3 rounded-full border-2 border-white bg-white ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-110 active:scale-105 cursor-pointer" />
          </SliderPrimitive.Root>
        </div>
        {!isMobile && (
          <span className="text-xs text-gray-400 whitespace-nowrap w-20 text-right">
            {getComplexityLabel(value)}
          </span>
        )}
      </div>
    )
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
        <SliderPrimitive.Root
          className="relative flex w-full touch-none select-none items-center h-5"
          defaultValue={[value]}
          value={[value]}
          max={100}
          step={1}
          onValueChange={handleChange}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow rounded-xl overflow-hidden bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400">
            <SliderPrimitive.Range className="absolute h-full bg-transparent" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-white bg-white ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-110 active:scale-105 cursor-pointer" />
        </SliderPrimitive.Root>
      </div>
      <div className="flex justify-between text-xs text-gray-400 px-1">
        <span>Simple</span>
        <span>Advanced</span>
      </div>
    </div>
  )
} 