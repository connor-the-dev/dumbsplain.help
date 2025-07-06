"use client"

import { useState, useCallback, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useAuth } from '@/lib/auth-context'

// Define conversation types (matching the existing structure)
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

// Supabase types
type SupabaseChat = Database['public']['Tables']['chats']['Row']
type ChatInsert = Database['public']['Tables']['chats']['Insert']
type ChatUpdate = Database['public']['Tables']['chats']['Update']

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

const clearStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}

// Convert between formats
const supabaseChatToLocal = (supabaseChat: SupabaseChat): Chat => {
  let conversation: Conversation | undefined = undefined
  
  if (supabaseChat.messages && Array.isArray(supabaseChat.messages)) {
    // Convert Supabase messages to our conversation format
    const items: ConversationItem[] = (supabaseChat.messages as any[]).map(msg => ({
      isUser: msg.role === 'user',
      content: msg.content
    }))
    
    conversation = {
      items,
      topic: supabaseChat.title
    }
  }
  
  return {
    id: supabaseChat.id,
    title: supabaseChat.title,
    timestamp: new Date(supabaseChat.updated_at),
    conversation
  }
}

const localChatToSupabase = (localChat: Chat): { title: string; messages: any[] } => {
  const messages: any[] = []
  
  if (localChat.conversation) {
    localChat.conversation.items.forEach(item => {
      if ('isUser' in item) {
        messages.push({
          role: item.isUser ? 'user' : 'assistant',
          content: item.content,
          timestamp: new Date().toISOString()
        })
      }
    })
  }
  
  return {
    title: localChat.title,
    messages
  }
}

export function useUnifiedChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [previousUser, setPreviousUser] = useState<any>(null)
  const { user } = useAuth()
  const supabase = createClientSupabase()

  // Initialize and handle auth state changes
  useEffect(() => {
    const isSigningIn = !previousUser && user // User just signed in
    const isSigningOut = previousUser && !user // User just signed out
    
    if (user) {
      // User is authenticated - load from Supabase
      if (isSigningIn) {
        // User just signed in - start fresh with a new chat
        setChats([{
          id: `temp-${Date.now()}`,
          title: 'New Chat',
          timestamp: new Date(),
          isActive: true,
          conversation: undefined
        }])
        setLoading(false)
      } else {
        // User was already signed in - load their existing chats
        fetchSupabaseChats()
      }
    } else {
      // User is anonymous
      if (isSigningOut) {
        // User just signed out - start fresh with a new anonymous chat
        setChats([{
          id: `temp-${Date.now()}`,
          title: 'New Chat',
          timestamp: new Date(),
          isActive: true,
          conversation: undefined
        }])
        setLoading(false)
      } else {
        // User was already anonymous - load from localStorage
        loadLocalChats()
      }
    }
    
    // Update previous user state
    setPreviousUser(user)
  }, [user])

  const loadLocalChats = () => {
    if (typeof window !== 'undefined') {
      const savedChats = loadFromStorage()
      if (savedChats.length > 0) {
        setChats(savedChats)
      } else {
        // Default chat if no saved chats
        const defaultChat: Chat = {
          id: Date.now().toString(),
          title: 'New Chat',
          timestamp: new Date(),
          isActive: true,
          conversation: undefined
        }
        setChats([defaultChat])
      }
    }
    setLoading(false)
  }

  const fetchSupabaseChats = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching chats:', error)
        return
      }

      const localChats = (data || []).map(supabaseChatToLocal)
      
      if (localChats.length > 0) {
        // Mark first chat as active
        localChats[0].isActive = true
        setChats(localChats)
      } else {
        // Create default chat for new user
        const defaultChat: Chat = {
          id: Date.now().toString(),
          title: 'New Chat',
          timestamp: new Date(),
          isActive: true,
          conversation: undefined
        }
        setChats([defaultChat])
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveToSupabase = useCallback(async (chat: Chat) => {
    if (!user) return

    try {
      const { title, messages } = localChatToSupabase(chat)
      
      const chatData: ChatInsert = {
        user_id: user.id,
        title,
        messages: messages as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('chats')
        .insert(chatData)
        .select()
        .single()

      if (error) {
        console.error('Error saving chat to Supabase:', error)
        return
      }

      // Update local state with Supabase ID
      setChats(prevChats => 
        prevChats.map(c => 
          c.id === chat.id ? { ...c, id: data.id } : c
        )
      )
    } catch (error) {
      console.error('Error saving chat to Supabase:', error)
    }
  }, [user, supabase])

  const updateSupabaseChat = useCallback(async (chatId: string, updates: Partial<ChatUpdate>) => {
    if (!user) return

    try {
      // Don't try to update chats with timestamp-based IDs (they haven't been saved to Supabase yet)
      if (chatId.startsWith('temp-') || /^\d+$/.test(chatId)) {
        console.log('Skipping Supabase update for temporary chat ID:', chatId)
        return null
      }

      const { data, error } = await supabase
        .from('chats')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating chat:', {
          error,
          chatId,
          updates,
          userId: user.id
        })
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating chat:', {
        error,
        chatId,
        updates,
        userId: user?.id
      })
      return null
    }
  }, [user, supabase])

  const createNewChat = useCallback(async (title?: string, firstMessage?: string) => {
    const tempId = `temp-${Date.now()}`
    const newChat: Chat = {
      id: tempId,
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

    // Save to appropriate storage
    if (user) {
      // Save to Supabase and update the ID
      await saveToSupabase(newChat)
    }

    return newChat.id
  }, [user, saveToSupabase])

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
      
      // Delete from Supabase if user is authenticated and chat has a valid Supabase ID
      if (user && !chatId.startsWith('temp-') && !/^\d+$/.test(chatId)) {
        supabase
          .from('chats')
          .delete()
          .eq('id', chatId)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Error deleting chat from Supabase:', error)
          })
      }
      
      // If we deleted the active chat, create a new empty chat
      if (deletedChatWasActive) {
        const newEmptyChat: Chat = {
          id: `temp-${Date.now()}`,
          title: 'New Chat',
          timestamp: new Date(),
          isActive: true,
          conversation: undefined
        }
        
        return [newEmptyChat, ...remainingChats.map(chat => ({ ...chat, isActive: false }))]
      }
      
      return remainingChats
    })
  }, [user, supabase])

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedChat = { ...chat, title: newTitle }
          
          // Update in Supabase if user is authenticated and chat has a valid Supabase ID
          if (user && !chatId.startsWith('temp-') && !/^\d+$/.test(chatId)) {
            updateSupabaseChat(chatId, { title: newTitle })
          }
          
          return updatedChat
        }
        return chat
      })
    )
  }, [user, updateSupabaseChat])

  const updateChatConversation = useCallback((chatId: string, conversation: Conversation) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedChat = { 
            ...chat, 
            conversation, 
            timestamp: new Date(),
            title: conversation.topic || chat.title
          }
          
          // Update in Supabase if user is authenticated and chat has a valid Supabase ID
          if (user && !chatId.startsWith('temp-') && !/^\d+$/.test(chatId)) {
            const { title, messages } = localChatToSupabase(updatedChat)
            updateSupabaseChat(chatId, { title, messages: messages as any })
          }
          
          return updatedChat
        }
        return chat
      })
    )
  }, [user, updateSupabaseChat])

  const addMessageToChat = useCallback((chatId: string, message: Message) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedConversation = {
            ...chat.conversation,
            items: [...(chat.conversation?.items || []), message],
            topic: chat.conversation?.topic || chat.title
          }
          const updatedChat = {
            ...chat,
            conversation: updatedConversation,
            timestamp: new Date()
          }
          
          // Update in Supabase if user is authenticated and chat has a valid Supabase ID
          if (user && !chatId.startsWith('temp-') && !/^\d+$/.test(chatId)) {
            const { title, messages } = localChatToSupabase(updatedChat)
            updateSupabaseChat(chatId, { title, messages: messages as any })
          }
          
          return updatedChat
        }
        return chat
      })
    )
  }, [user, updateSupabaseChat])

  const shareChat = useCallback((chatId: string) => {
    // Placeholder for share functionality
    console.log('Sharing chat:', chatId)
  }, [])

  const getActiveChat = useCallback(() => {
    return chats.find(chat => chat.isActive) || null
  }, [chats])

  // Save to localStorage for anonymous users
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      saveToStorage(chats)
    }
  }, [chats, user])

  // Clear localStorage when user signs in (data will be in Supabase)
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      clearStorage()
    }
  }, [user])

  return {
    chats,
    loading,
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