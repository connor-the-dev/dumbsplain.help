"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PanelLeft, 
  Plus, 
  Search, 
  MoreHorizontal, 
  MessageSquare, 
  Share,
  Edit2,
  Trash2,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { Chat } from '@/hooks/use-chat-history'

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  chats: Chat[]
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newTitle: string) => void
  onShareChat: (chatId: string) => void
}

export function ChatSidebar({
  isOpen,
  onToggle,
  chats,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onShareChat
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  // Add keyboard shortcut for tab key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Only trigger if not in an input field
        const activeElement = document.activeElement
        const isInInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'
        
        if (!isInInput) {
          event.preventDefault()
          onToggle()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggle])

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRenameStart = (chat: Chat) => {
    setEditingChatId(chat.id)
    setEditingTitle(chat.title)
  }

  const handleRenameSubmit = () => {
    if (editingChatId && editingTitle.trim()) {
      onRenameChat(editingChatId, editingTitle.trim())
    }
    setEditingChatId(null)
    setEditingTitle('')
  }

  const handleRenameCancel = () => {
    setEditingChatId(null)
    setEditingTitle('')
  }

  const formatTimestamp = (timestamp: Date | string | number) => {
    const now = new Date()
    let date: Date
    
    // Handle different timestamp types
    if (timestamp instanceof Date) {
      date = timestamp
    } else {
      date = new Date(timestamp)
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Unknown'
    }
    
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${Math.floor(hours)}h ago`
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 200,
              duration: 0.3
            }}
            className="fixed left-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-md border-r border-gray-800 z-50 flex flex-col rounded-r-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-yellow-400" />
                  <h2 className="font-semibold text-white">Chats</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="text-gray-400 hover:text-white p-1 rounded-xl hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* New Chat Button */}
              <div className="relative p-[2px] bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400 rounded-xl animate-gradient bg-[length:200%_auto]">
                <button
                  onClick={onNewChat}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white border-0 font-medium rounded-[10px] px-4 py-2 flex items-center justify-center transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </button>
              </div>

              {/* Search */}
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-gray-600 rounded-xl"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence>
                {filteredChats.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    {searchQuery ? 'No chats found' : 'No chats yet'}
                  </div>
                ) : (
                  filteredChats.map((chat, index) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative p-3 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-200 ${
                        chat.isActive 
                          ? 'bg-gray-800 border border-gray-700' 
                          : 'hover:bg-gray-800/50'
                      }`}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {editingChatId === chat.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenameSubmit()
                                  if (e.key === 'Escape') handleRenameCancel()
                                }}
                                onBlur={handleRenameSubmit}
                                className="text-sm bg-gray-700 border-gray-600 text-white h-8 rounded-lg"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <>
                              <h3 className="font-medium text-white text-sm truncate">
                                {chat.title}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimestamp(chat.timestamp)}
                              </p>
                            </>
                          )}
                        </div>

                        {editingChatId !== chat.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity p-1 h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700 data-[state=open]:bg-gray-700 rounded-xl"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end" 
                              className="bg-gray-800 border-gray-700 text-white rounded-xl"
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onShareChat(chat.id)
                                }}
                                className="hover:bg-gray-700 text-gray-300 hover:text-white"
                              >
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRenameStart(chat)
                                }}
                                className="hover:bg-gray-700 text-gray-300 hover:text-white"
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-700" />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteChat(chat.id)
                                }}
                                className="hover:bg-red-600 text-red-400 hover:text-white"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                {filteredChats.length} chat{filteredChats.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 