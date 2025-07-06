"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Mail, Lock, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { EmailConfirmation } from "@/components/email-confirmation"

interface AuthPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthPopup({ isOpen, onClose }: AuthPopupProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  })
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { error } = await signIn(formData.email, formData.password)
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        })
        setIsLoading(false)
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully."
        })
        setIsLoading(false)
        onClose()
      }
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const { error } = await signUp(formData.email, formData.password, formData.name)
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        })
      } else {
        // Show email confirmation screen instead of closing
        setShowEmailConfirmation(true)
      }
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailConfirmationClose = () => {
    setShowEmailConfirmation(false)
    setFormData({ email: '', password: '', name: '' }) // Reset form
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && !showEmailConfirmation && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-md bg-gray-900 border-gray-700 rounded-2xl shadow-2xl">
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute right-2 top-2 h-8 w-8 rounded-lg hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 text-transparent bg-clip-text animate-gradient bg-[length:200%_auto]">
                    Welcome to dumbsplain.help
                  </CardTitle>
                  <CardDescription className="text-center text-gray-400">
                    Sign in to save your chat history and preferences
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800 rounded-xl">
                      <TabsTrigger 
                        value="signin" 
                        className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
                      >
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger 
                        value="signup" 
                        className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white"
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="space-y-4">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email" className="text-gray-300">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="signin-email"
                              type="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="pl-10 bg-gray-800 border-gray-700 rounded-xl focus:border-blue-400 focus:ring-blue-400"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signin-password" className="text-gray-300">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="signin-password"
                              type="password"
                              placeholder="Enter your password"
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                              className="pl-10 bg-gray-800 border-gray-700 rounded-xl focus:border-blue-400 focus:ring-blue-400"
                              required
                            />
                          </div>
                        </div>

                        <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 rounded-xl animate-gradient bg-[length:200%_auto]">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white border-0 font-medium rounded-[10px] px-4 py-3 flex items-center justify-center transition-colors duration-200"
                          >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                          </button>
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name" className="text-gray-300">Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="signup-name"
                              type="text"
                              placeholder="Enter your name"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="pl-10 bg-gray-800 border-gray-700 rounded-xl focus:border-yellow-400 focus:ring-yellow-400"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className="pl-10 bg-gray-800 border-gray-700 rounded-xl focus:border-yellow-400 focus:ring-yellow-400"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="signup-password"
                              type="password"
                              placeholder="Create a password"
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                              className="pl-10 bg-gray-800 border-gray-700 rounded-xl focus:border-yellow-400 focus:ring-yellow-400"
                              required
                            />
                          </div>
                        </div>

                        <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 rounded-xl animate-gradient bg-[length:200%_auto]">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white border-0 font-medium rounded-[10px] px-4 py-3 flex items-center justify-center transition-colors duration-200"
                          >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                          </button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                      By continuing, you agree to our terms of service and privacy policy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
      
      {/* Email Confirmation Screen */}
      {showEmailConfirmation && (
        <EmailConfirmation
          email={formData.email}
          onClose={handleEmailConfirmationClose}
        />
      )}
    </AnimatePresence>
  )
} 