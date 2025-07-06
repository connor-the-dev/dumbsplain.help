"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  Crown, 
  MessageSquare, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronDown 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileDropdownProps {
  onUpgrade: () => void
  onFeedback: () => void
  onSettings: () => void
  onHelp: () => void
  onLogout: () => void
}

export function ProfileDropdown({ 
  onUpgrade, 
  onFeedback, 
  onSettings, 
  onHelp, 
  onLogout 
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      icon: Crown,
      label: "Upgrade Plan",
      onClick: onUpgrade,
      isLogout: false
    },
    {
      icon: MessageSquare,
      label: "Feedback",
      onClick: onFeedback,
      isLogout: false
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: onSettings,
      isLogout: false
    },
    {
      icon: HelpCircle,
      label: "Help",
      onClick: onHelp,
      isLogout: false
    },
    {
      icon: LogOut,
      label: "Log Out",
      onClick: onLogout,
      isLogout: true
    }
  ]

  const handleItemClick = (onClick: () => void) => {
    onClick()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleItemClick(item.onClick)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-800/50 group"
                  >
                    <item.icon className={cn(
                      "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                      item.isLogout ? "text-red-400" : "text-white"
                    )} />
                    <span className={cn(
                      "transition-colors duration-200 group-hover:text-white",
                      item.isLogout ? "text-red-400" : "text-gray-200"
                    )}>
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
} 