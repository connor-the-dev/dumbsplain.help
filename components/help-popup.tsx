"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, HelpCircle, MessageSquare, Sliders, BookOpen, Zap } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface HelpPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpPopup({ isOpen, onClose }: HelpPopupProps) {
  const isMobile = useIsMobile()
  
  const steps = [
    {
      icon: MessageSquare,
      title: "Ask Anything",
      description: "Type any topic or question you want explained",
      color: "text-blue-400"
    },
    {
      icon: Sliders,
      title: "Choose Your Level",
      description: "Use the complexity slider to match your understanding",
      color: "text-yellow-400"
    },
    {
      icon: BookOpen,
      title: "Learn & Understand",
      description: "Get clear explanations tailored to any level of complexity",
      color: "text-red-400"
    },
    {
      icon: Zap,
      title: "Test Your Knowledge",
      description: "Generate quizzes to reinforce learning at any level of understanding",
      color: "text-blue-400"
    }
  ]

  const features = [
    "Smart AI-powered explanations",
    "Interactive follow-up questions",
    "Custom quiz generation",
    "Chat history tracking",
    "Multiple complexity levels",
    "Fast & reliable responses"
  ]

  const tips = [
    "Be specific with your questions",
    "Adjust complexity to match your level",
    "Ask follow-up questions",
    "Use quizzes to test understanding",
    "Review chat history for learning"
  ]

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
              className={`bg-gray-900 border border-gray-700 rounded-xl p-6 w-full shadow-2xl my-8 ${
                isMobile ? "max-w-sm" : "max-w-3xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-blue-400" />
                  <div>
                    <h2 className={`font-bold text-white ${isMobile ? "text-lg" : "text-xl"}`}>
                      How dumbsplain.help works
                    </h2>
                    <p className="text-gray-400 text-sm">Your guide to everything</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isMobile ? (
                /* Mobile Condensed Version */
                <div className="space-y-4">
                  {/* Quick Steps */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Quick Steps</h3>
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-2 rounded-xl bg-gray-800/50"
                        >
                          <step.icon className={`w-5 h-5 ${step.color} flex-shrink-0`} />
                          <div>
                            <h4 className="font-medium text-white text-sm">{step.title}</h4>
                            <p className="text-xs text-gray-400">{step.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tips */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">💡 Pro Tips</h3>
                    <div className="space-y-1">
                      {tips.map((tip, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0 mt-2" />
                          <span className="text-xs text-gray-300">{tip}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop Full Version */
                <>
                  {/* How It Works */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {steps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-gray-600 transition-all duration-200"
                        >
                          <div className="flex items-start gap-3">
                            <step.icon className={`w-8 h-8 ${step.color} flex-shrink-0`} />
                            <div>
                              <h4 className="font-medium text-white mb-1">{step.title}</h4>
                              <p className="text-sm text-gray-400">{step.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Features & Tips */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key Features */}
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
                      <div className="space-y-2">
                        {features.map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-2"
                          >
                            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-lg font-semibold text-white mb-3">💡 Pro Tips</h3>
                      <div className="space-y-2">
                        {tips.map((tip, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-2"
                          >
                            <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2" />
                            <span className="text-sm text-gray-300">{tip}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 