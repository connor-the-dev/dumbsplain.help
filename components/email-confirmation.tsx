"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface EmailConfirmationProps {
  email: string
  onClose: () => void
}

export function EmailConfirmation({ email, onClose }: EmailConfirmationProps) {
  const [isChecking, setIsChecking] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // If user becomes authenticated (email confirmed), close the screen
  if (user && user.email_confirmed_at) {
    setTimeout(() => {
      toast({
        title: "Welcome!",
        description: "Your email is confirmed. You're now logged in."
      })
      onClose()
    }, 100)
  }

  const handleDone = async () => {
    setIsChecking(true)
    
    try {
      // Get fresh user session to check confirmation status
      const { createClientSupabase } = await import("@/lib/supabase")
      const supabase = createClientSupabase()
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      if (session?.user?.email_confirmed_at) {
        toast({
          title: "Welcome!",
          description: "Your email is confirmed. You're now logged in."
        })
        onClose()
        return
      }

      // If not confirmed, show reminder
      toast({
        title: "Please confirm your email",
        description: "Check your inbox and click the confirmation link to continue.",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Please confirm your email",
        description: "Check your inbox and click the confirmation link to continue.",
        variant: "default"
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl"
      >
        {/* Email Icon */}
        <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-blue-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">
          Confirm Your Email
        </h2>

        {/* Description */}
        <p className="text-gray-300 mb-2">
          We've sent a confirmation email to:
        </p>
        <p className="text-blue-400 font-medium mb-6">
          {email}
        </p>

        {/* Instructions */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Next steps:
          </h3>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
            <li>Check your email inbox</li>
            <li>Click the confirmation link</li>
            <li>Return here and click "Done"</li>
          </ol>
        </div>

        {/* Done Button - Styled like New Chat button */}
        <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 rounded-xl animate-gradient bg-[length:200%_auto]">
          <button
            onClick={handleDone}
            disabled={isChecking}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white border-0 font-medium rounded-[10px] px-4 py-3 flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Done'}
          </button>
        </div>

        {/* Skip option */}
        <button
          onClick={onClose}
          className="mt-4 text-gray-400 hover:text-white text-sm underline transition-colors"
        >
          Skip for now
        </button>
      </motion.div>
    </motion.div>
  )
} 