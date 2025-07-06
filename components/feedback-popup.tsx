"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, MessageSquare } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

interface FeedbackPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackPopup({ isOpen, onClose }: FeedbackPopupProps) {
  const { user } = useAuth()
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
    
    try {
      // Prepare form data for Formspree
      const submitData = {
        name: user?.user_metadata?.full_name || user?.user_metadata?.name || formData.name,
        email: user?.email || formData.email,
        feedback: formData.feedback,
        _subject: "New Feedback from dumbsplain.help"
      }

      const response = await fetch("https://formspree.io/f/xjkrdlpz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          onClose()
          setSubmitted(false)
          setFormData({ name: "", email: "", feedback: "" })
        }, 2000)
      } else {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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
                    {/* Only show name and email fields if user is not logged in */}
                    {!user && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Name *
                          </label>
                          <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Your name"
                            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email *
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="your@email.com"
                            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl"
                            required
                          />
                        </div>
                      </>
                    )}

                    {/* Show user info if logged in */}
                    {user && (
                      <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">Sending feedback as:</p>
                        <p className="text-white font-medium">
                          {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                        </p>
                        <p className="text-gray-300 text-sm">{user.email}</p>
                      </div>
                    )}

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
                      {formData.feedback.trim() && 
                       (user || (formData.name.trim() && formData.email.trim())) && 
                       !isSubmitting ? (
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