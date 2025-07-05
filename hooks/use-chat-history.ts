"use client"

import { useState, useCallback, useEffect } from 'react'

// Define conversation types
interface Message {
  isUser: boolean;
  content: string;
}

interface QuizItem {
  type: 'quiz';
  topic: string;
  questions: any[];
  id: string;
}

type ConversationItem = Message | QuizItem;

interface Conversation {
  items: ConversationItem[];
  topic: string;
}

export interface Chat {
  id: string
  title: string
  timestamp: Date
  isActive?: boolean
  conversation?: Conversation
}

const STORAGE_KEY = 'dumbsplain-chat-history'

// Helper functions for localStorage
const saveToStorage = (chats: Chat[]) => {
  try {
    const serializedChats = JSON.stringify(chats, (key, value) => {
      if (key === 'timestamp' && value instanceof Date) {
        return value.toISOString()
      }
      return value
    })
    localStorage.setItem(STORAGE_KEY, serializedChats)
  } catch (error) {
    console.error('Failed to save chats to localStorage:', error)
  }
}

const loadFromStorage = (): Chat[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const parsed = JSON.parse(stored)
    return parsed.map((chat: any) => ({
      ...chat,
      timestamp: new Date(chat.timestamp)
    }))
  } catch (error) {
    console.error('Failed to load chats from localStorage:', error)
    return []
  }
}

export function useChatHistory() {
  const [chats, setChats] = useState<Chat[]>(() => {
    // Only load from localStorage on client side
    if (typeof window !== 'undefined') {
      const savedChats = loadFromStorage()
      if (savedChats.length > 0) {
        return savedChats
      }
    }
    
    // Default chat if no saved chats
    return [
      {
        id: Date.now().toString(),
        title: 'New Chat',
        timestamp: new Date(),
        isActive: true,
        conversation: undefined
      }
    ]
  })

  // Save to localStorage whenever chats change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveToStorage(chats)
    }
  }, [chats])

  const createNewChat = useCallback((title?: string, firstMessage?: string) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: title || 'New Chat',
      timestamp: new Date(),
      isActive: true,
      conversation: firstMessage ? {
        items: [{ isUser: true, content: firstMessage }],
        topic: title || firstMessage || 'New Chat'
      } : undefined
    }

    setChats(prevChats => [
      newChat,
      ...prevChats.map(chat => ({ ...chat, isActive: false }))
    ])

    return newChat.id
  }, [])

  const selectChat = useCallback((chatId: string) => {
    setChats(prevChats =>
      prevChats.map(chat => ({
        ...chat,
        isActive: chat.id === chatId
      }))
    )
  }, [])

  const deleteChat = useCallback((chatId: string) => {
    setChats(prevChats => {
      const deletedChatWasActive = prevChats.find(chat => chat.id === chatId)?.isActive
      const remainingChats = prevChats.filter(chat => chat.id !== chatId)
      
      // If we deleted the active chat, create a new empty chat
      if (deletedChatWasActive) {
        const newEmptyChat: Chat = {
          id: Date.now().toString(),
          title: 'New Chat',
          timestamp: new Date(),
          isActive: true,
          conversation: undefined
        }
        
        return [newEmptyChat, ...remainingChats.map(chat => ({ ...chat, isActive: false }))]
      }
      
      return remainingChats
    })
  }, [])

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    )
  }, [])

  const updateChatConversation = useCallback((chatId: string, conversation: Conversation) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId ? { 
          ...chat, 
          conversation, 
          timestamp: new Date(),
          title: conversation.topic || chat.title
        } : chat
      )
    )
  }, [])

  const addMessageToChat = useCallback((chatId: string, message: Message) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedConversation = {
            ...chat.conversation,
            items: [...(chat.conversation?.items || []), message],
            topic: chat.conversation?.topic || chat.title
          }
          return {
            ...chat,
            conversation: updatedConversation,
            timestamp: new Date()
          }
        }
        return chat
      })
    )
  }, [])

  const shareChat = useCallback((chatId: string) => {
    // Placeholder for share functionality
    console.log('Sharing chat:', chatId)
    // In a real app, this would generate a shareable link
  }, [])

  const getActiveChat = useCallback(() => {
    return chats.find(chat => chat.isActive) || null
  }, [chats])

  return {
    chats,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    updateChatConversation,
    addMessageToChat,
    shareChat,
    getActiveChat
  }
} 