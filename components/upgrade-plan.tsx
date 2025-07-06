"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Crown, Zap, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UpgradePlanProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradePlan({ isOpen, onClose }: UpgradePlanProps) {
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      icon: Crown,
      iconColor: "text-yellow-400",
      features: [
        "5 explanations per day",
        "Basic complexity levels",
        "Standard response time",
        "Community support"
      ],
      popular: false
    },
    {
      id: "curious",
      name: "Curious",
      price: "$3.99",
      period: "month",
      description: "For the naturally curious",
      icon: Zap,
      iconColor: "text-blue-400",
      features: [
        "50 explanations per day",
        "All complexity levels",
        "Priority response time",
        "Email support",
        "Quiz generation",
        "Chat history"
      ],
      popular: true
    },
    {
      id: "thinker",
      name: "Thinker",
      price: "$7.99",
      period: "month",
      description: "For deep thinkers and learners",
      icon: Sparkles,
      iconColor: "text-red-400",
      features: [
        "Unlimited explanations",
        "All complexity levels",
        "Instant response time",
        "Priority support",
        "Advanced quiz modes",
        "Unlimited chat history",
        "Custom complexity presets",
        "Export explanations"
      ],
      popular: false
    }
  ]

  const handleUpgrade = (planId: string) => {
    // TODO: Implement upgrade logic
    console.log(`Upgrading to ${planId} plan`)
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
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-4xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Upgrade Your Plan</h2>
                    <p className="text-gray-400 text-sm">Choose the perfect plan for your learning journey</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg flex flex-col ${
                      plan.popular
                        ? "border-blue-500 bg-blue-500/5 hover:shadow-blue-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Most Popular
                        </div>
                      </div>
                    )}

                    {/* Plan Icon */}
                    <div className="mb-4">
                      <plan.icon className={`w-12 h-12 ${plan.iconColor}`} />
                    </div>

                    {/* Plan Details */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{plan.description}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                        <span className="text-gray-400 text-sm">/{plan.period}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6 flex-1">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Upgrade Button */}
                    <div className="mt-auto">
                      {plan.id === "free" ? (
                        <Button
                          disabled
                          className="w-full bg-gray-700 text-gray-400 cursor-not-allowed font-medium rounded-xl py-3"
                        >
                          Current Plan
                        </Button>
                      ) : (
                        <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 rounded-xl animate-gradient bg-[length:200%_auto]">
                          <button
                            onClick={() => handleUpgrade(plan.id)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white border-0 font-medium rounded-[10px] px-4 py-3 transition-colors duration-200"
                          >
                            Upgrade to {plan.name}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <p className="text-center text-gray-400 text-sm">
                  All plans include our core AI-powered explanations. Upgrade or downgrade anytime.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 