"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageSquare, Copy, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'


interface SharedMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface SharedChat {
  id: string
  title: string
  messages: SharedMessage[]
  created_at: string
  updated_at: string
}

export default function SharedChatPage() {
  const params = useParams()
  const chatId = params.chatId as string
  const [chat, setChat] = useState<SharedChat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (chatId) {
      fetchSharedChat()
    }
  }, [chatId])

  const fetchSharedChat = async () => {
    try {
      const response = await fetch(`/api/share-chat?chatId=${chatId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch chat')
      }

      setChat(data.chat)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading shared chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Chat Not Found</h1>
          <p className="text-gray-400 mb-6">
            This chat doesn't exist or is no longer available for sharing.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >
            Go to DumbSplain
          </Button>
        </div>
      </div>
    )
  }

  if (!chat) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">{chat.title}</h1>
              <p className="text-sm text-gray-400">
                Shared chat · {new Date(chat.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={copyLink}
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 hover:border-gray-600 rounded-xl"
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              Try DumbSplain
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {chat.messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${
                message.role === 'user' 
                  ? 'bg-blue-900/20 border-blue-500/30' 
                  : 'bg-gray-800/50 border-gray-700'
              } p-6 rounded-xl border`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gray-600'
                }`}>
                  {message.role === 'user' ? (
                    <span className="text-white font-medium text-sm">U</span>
                  ) : (
                    <span className="text-white font-medium text-sm">A</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-300">
                      {message.role === 'user' ? 'You' : 'DumbSplain'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-200">
                    {message.role === 'assistant' ? (
                      <div className="prose prose-invert max-w-none">
                        <div 
                          className="text-gray-200 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: message.content
                              .replace(/<blue>(.*?)<\/blue>/g, '<span class="text-blue-400 font-medium">$1</span>')
                              .replace(/<red>(.*?)<\/red>/g, '<span class="text-red-400 font-medium">$1</span>')
                              .replace(/<yellow>(.*?)<\/yellow>/g, '<span class="text-yellow-400 font-medium">$1</span>')
                              .replace(/\n\n/g, '</p><p class="mb-4">')
                              .replace(/\n/g, '<br>')
                          }}
                        />
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 mb-4">
            Want to create your own explanations?
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 hover:from-blue-500 hover:via-purple-600 hover:to-red-500 text-white rounded-xl px-8 py-3"
          >
            Start Using DumbSplain
          </Button>
        </div>
      </div>
    </div>
  )
} 