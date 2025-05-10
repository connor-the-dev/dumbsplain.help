"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FollowUpQuestionProps {
  onSubmit: (question: string) => void;
  isLoading?: boolean;
}

export function FollowUpQuestion({ onSubmit, isLoading = false }: FollowUpQuestionProps) {
  const [followUp, setFollowUp] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!followUp.trim()) return
    onSubmit(followUp)
    setFollowUp("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="followUp" className="text-md font-medium text-gray-300">
          Want to know more? Ask a follow-up question:
        </label>
        <div className="relative">
          <Input
            id="followUp"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Why? How? What else?"
            className="pl-4 pr-12 py-3 text-md bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-xl"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-8 h-8"
            disabled={!followUp.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
