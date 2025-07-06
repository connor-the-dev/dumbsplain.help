"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Settings, User, Sliders, Shield, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { useUserSettings } from "@/hooks/use-user-settings"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface SettingsPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPopup({ isOpen, onClose }: SettingsPopupProps) {
  const [activeTab, setActiveTab] = useState("account")
  const { user, signOut } = useAuth()
  const { settings, updateDefaultLength, updateNotifications } = useUserSettings()
  const { toast } = useToast()

  const handleLogout = async () => {
    await signOut()
    onClose()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    })
  }

  const tabs = [
    { id: "account", label: "Account", icon: User, color: "text-blue-400" },
    { id: "preferences", label: "Preferences", icon: Sliders, color: "text-yellow-400" },
    { id: "security", label: "Security", icon: Shield, color: "text-red-400" }
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
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-blue-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <p className="text-gray-400 text-sm">Manage your account and preferences</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="space-y-6">
                {activeTab === "account" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-white font-medium mb-4">Profile Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Email</span>
                          <span className="text-gray-400">{user?.email || 'Not available'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Plan</span>
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            Free Plan
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Member since</span>
                          <span className="text-gray-400">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50">
                        Change Password
                      </Button>
                      <Button 
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </Button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "preferences" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-white font-medium mb-4">Default Length</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-200">Response Length</p>
                            <p className="text-sm text-gray-400">Choose default length for explanations</p>
                          </div>
                          <select 
                            value={settings.default_length} 
                            onChange={(e) => updateDefaultLength(e.target.value as 'short' | 'medium' | 'long')}
                            className="p-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm"
                          >
                            <option value="short">Short</option>
                            <option value="medium">Medium</option>
                            <option value="long">Long</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-200">Notifications</p>
                            <p className="text-sm text-gray-400">Enable push notifications</p>
                          </div>
                          <Switch
                            checked={settings.notifications_enabled}
                            onCheckedChange={(checked) => updateNotifications(checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "security" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-white font-medium mb-4">Account Security</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-200">Password</p>
                            <p className="text-sm text-gray-400">Update your password</p>
                          </div>
                          <Button 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 button-shimmer"
                          >
                            Change
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-200">Email</p>
                            <p className="text-sm text-gray-400">Update your email address</p>
                          </div>
                          <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 rounded-xl animate-gradient bg-[length:200%_auto]">
                            <button className="bg-slate-800 hover:bg-slate-700 text-white border-0 font-medium rounded-[10px] px-4 py-2 flex items-center justify-center transition-colors duration-200 text-sm">
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h3 className="text-white font-medium mb-4">Data Management</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-200">Export Data</p>
                            <p className="text-sm text-gray-400">Download your chat history</p>
                          </div>
                          <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 rounded-xl animate-gradient bg-[length:200%_auto]">
                            <button className="bg-slate-800 hover:bg-slate-700 text-white border-0 font-medium rounded-[10px] px-4 py-2 flex items-center justify-center transition-colors duration-200 text-sm">
                              Export
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-200">Delete Account</p>
                            <p className="text-sm text-gray-400">Permanently delete your account</p>
                          </div>
                          <Button 
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50">
                        Login History
                      </Button>
                      <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50">
                        Revoke Sessions
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 