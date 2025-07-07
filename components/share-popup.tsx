"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Share2, Copy, Check, ExternalLink, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface SharePopupProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  chatTitle: string
  isLoading?: boolean
  error?: string
}

export function SharePopup({ 
  isOpen, 
  onClose, 
  shareUrl, 
  chatTitle, 
  isLoading = false, 
  error 
}: SharePopupProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "The share link has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to your clipboard.",
        variant: "destructive",
      })
    }
  }

  const openInNewTab = () => {
    window.open(shareUrl, '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Share Chat</h2>
                    <p className="text-sm text-gray-400">Anyone with the link can view</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {/* Chat Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chat Title
                  </label>
                  <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                    <p className="text-white truncate">{chatTitle}</p>
                  </div>
                </div>

                {/* Share URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Share Link
                  </label>
                  
                  {isLoading ? (
                    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                        <span className="text-gray-400">Generating link...</span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">{error}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={copyToClipboard}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-700 rounded-lg"
                          >
                            {copied ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            onClick={openInNewTab}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-700 rounded-lg"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border-gray-700 hover:border-gray-600 rounded-xl"
                  >
                    Close
                  </Button>
                  {shareUrl && !isLoading && !error && (
                    <Button
                      onClick={copyToClipboard}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-400">
                  Anyone with this link can view the chat in read-only mode. 
                  They won't be able to edit or continue the conversation.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 