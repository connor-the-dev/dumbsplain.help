"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, MessageSquare } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface FeedbackPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackPopup({ isOpen, onClose }: FeedbackPopupProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // TODO: Connect to Formspree later
    // For now, simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        setFormData({ name: "", email: "", feedback: "" })
      }, 2000)
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {!submitted ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-blue-400" />
                      <h2 className="text-xl font-bold text-white">Share Feedback</h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Name (Optional)
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your name"
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email (Optional)
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Feedback *
                      </label>
                      <Textarea
                        value={formData.feedback}
                        onChange={(e) => handleInputChange("feedback", e.target.value)}
                        placeholder="Tell us what you think! Any suggestions, bugs, or features you'd like to see?"
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl min-h-24"
                        required
                      />
                    </div>

                    {/* Send Feedback Button - styled exactly like upgrade button */}
                    <div className="mt-auto">
                      {formData.feedback.trim() && !isSubmitting ? (
                        <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 rounded-xl animate-gradient bg-[length:200%_auto]">
                          <button
                            type="submit"
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white border-0 font-medium rounded-[10px] px-4 py-3 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Send className="w-4 h-4" />
                              Send Feedback
                            </div>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="submit"
                          disabled
                          className="w-full bg-gray-700 text-gray-400 cursor-not-allowed font-medium rounded-xl py-3 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Send Feedback
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                </>
              ) : (
                /* Success State */
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl text-white">✓</div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Thank you!</h3>
                  <p className="text-gray-400">
                    Your feedback has been sent. We really appreciate it!
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 