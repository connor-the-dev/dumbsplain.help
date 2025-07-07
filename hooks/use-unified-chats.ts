"use client"

import { useState, useCallback, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useAuth } from '@/lib/auth-context'
import { useStickyState } from './use-sticky-state'

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

// Convert between formats for Supabase sync (background only)
const supabaseChatToLocal = (supabaseChat: SupabaseChat): Chat => {
  let conversation: Conversation | undefined = undefined
  
  if (supabaseChat.messages && Array.isArray(supabaseChat.messages)) {
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
  const { user, loading: authLoading } = useAuth()
  const supabase = createClientSupabase()
  
  // Use sticky state for automatic localStorage persistence
  const [chats, setChats] = useStickyState<Chat[]>([], 'dumbsplain-chat-history')
  const [activeId, setActiveId] = useStickyState<string>('', 'dumbsplain-active-chat')
  const [loading, setLoading] = useState(true)

  // Initialize with default chat if no chats exist
  useEffect(() => {
    if (!authLoading && chats.length === 0) {
      const defaultChat: Chat = {
        id: `temp-${Date.now()}`,
        title: 'New Chat',
        timestamp: new Date(),
        isActive: true,
        conversation: undefined
      }
      setChats([defaultChat])
      setActiveId(defaultChat.id)
    }
    setLoading(false)
  }, [authLoading, chats.length, setChats, setActiveId])

    // Ensure active chat is properly set
  useEffect(() => {
    if (chats.length > 0) {
      const currentActiveChat = chats.find(chat => chat.isActive)
      const targetActiveChat = chats.find(chat => chat.id === activeId)
      
      // Case 1: activeId exists but doesn't match any chat - select first chat
      if (activeId && !targetActiveChat) {
        const firstChat = chats[0]
        if (!firstChat.isActive) {
          const updatedChats = chats.map(chat => ({
            ...chat,
            isActive: chat.id === firstChat.id
          }))
          setChats(updatedChats)
        }
        setActiveId(firstChat.id)
      }
      // Case 2: activeId exists and matches a chat, but that chat isn't marked active
      else if (activeId && targetActiveChat && !targetActiveChat.isActive) {
        const updatedChats = chats.map(chat => ({
          ...chat,
          isActive: chat.id === activeId
        }))
        setChats(updatedChats)
      }
      // Case 3: activeId exists and matches a chat, but another chat is marked active
      else if (activeId && targetActiveChat && currentActiveChat && currentActiveChat.id !== activeId) {
        const updatedChats = chats.map(chat => ({
          ...chat,
          isActive: chat.id === activeId
        }))
        setChats(updatedChats)
      }
      // Case 4: activeId is empty (new chat mode) - make sure no chat is active
      else if (!activeId && currentActiveChat) {
        const updatedChats = chats.map(chat => ({
          ...chat,
          isActive: false
        }))
        setChats(updatedChats)
      }
    }
  }, [activeId]) // Only depend on activeId, not chats

  // Handle authentication state changes
  useEffect(() => {
    let isMounted = true
    
    if (!authLoading) {
      const handleAuthStateChange = async () => {
        if (user) {
          // User logged in - clear localStorage chats and load from Supabase
          console.log('User logged in, loading chats from Supabase and clearing localStorage')
          
          // Clear localStorage first
          try {
            localStorage.removeItem('dumbsplain-chat-history')
            localStorage.removeItem('dumbsplain-active-chat')
          } catch (error) {
            console.error('Error clearing localStorage on login:', error)
          }
          
          try {
            // Fetch user's chats from Supabase
            const { data: supabaseChats, error } = await supabase
              .from('chats')
              .select('*')
              .eq('user_id', user.id)
              .order('updated_at', { ascending: false })

            if (error) {
              console.error('Error loading user chats:', error)
              return
            }

            // Convert Supabase chats to local format
            const userChats = (supabaseChats || []).map(supabaseChatToLocal)
            
            if (isMounted) {
              if (userChats.length > 0) {
                // Set the first chat as active
                const chatsWithActiveFlag = userChats.map((chat, index) => ({
                  ...chat,
                  isActive: index === 0
                }))
                setChats(chatsWithActiveFlag)
                setActiveId(chatsWithActiveFlag[0].id)
              } else {
                // No chats found, create a new empty chat
                const newEmptyChat: Chat = {
                  id: `temp-${Date.now()}`,
                  title: 'New Chat',
                  timestamp: new Date(),
                  isActive: true,
                  conversation: undefined
                }
                setChats([newEmptyChat])
                setActiveId(newEmptyChat.id)
              }
            }
          } catch (error) {
            console.error('Error during auth state change:', error)
          }
        } else {
          // User logged out - clear chats and localStorage, start fresh
          console.log('User logged out, clearing chats and localStorage, starting fresh')
          
          if (isMounted) {
            // Clear localStorage
            try {
              localStorage.removeItem('dumbsplain-chat-history')
              localStorage.removeItem('dumbsplain-active-chat')
            } catch (error) {
              console.error('Error clearing localStorage:', error)
            }
            
            // Create a new empty chat for anonymous usage
            const newEmptyChat: Chat = {
              id: `temp-${Date.now()}`,
              title: 'New Chat',
              timestamp: new Date(),
              isActive: true,
              conversation: undefined
            }
            setChats([newEmptyChat])
            setActiveId(newEmptyChat.id)
          }
        }
      }

      handleAuthStateChange()
    }

    return () => {
      isMounted = false
    }
  }, [user, authLoading, setChats, setActiveId, supabase]) // Re-run when user auth state changes

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

    const updatedChats = [
      newChat,
      ...chats.map(chat => ({ ...chat, isActive: false }))
    ]
    
    setChats(updatedChats)
    setActiveId(tempId)

    return newChat.id
  }, [chats, setChats, setActiveId])

  const selectChat = useCallback((chatId: string) => {
    const updatedChats = chats.map(chat => ({
      ...chat,
      isActive: chat.id === chatId
    }))
    setChats(updatedChats)
    setActiveId(chatId)
  }, [chats, setChats, setActiveId])

  const deleteChat = useCallback((chatId: string) => {
    const remainingChats = chats.filter(chat => chat.id !== chatId)
    const deletedChatWasActive = chats.find(chat => chat.id === chatId)?.isActive
    
    if (remainingChats.length === 0) {
      // Create new empty chat if all deleted
      const newEmptyChat: Chat = {
        id: `temp-${Date.now()}`,
        title: 'New Chat',
        timestamp: new Date(),
        isActive: true,
        conversation: undefined
      }
      setChats([newEmptyChat])
      setActiveId(newEmptyChat.id)
    } else if (deletedChatWasActive) {
      // Make first remaining chat active
      remainingChats[0].isActive = true
      setChats(remainingChats)
      setActiveId(remainingChats[0].id)
    } else {
      setChats(remainingChats)
    }

    // Background Supabase deletion for authenticated users
    if (user && !chatId.startsWith('temp-') && !/^\d+$/.test(chatId)) {
      supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.error('Background Supabase deletion failed:', error)
        })
    }
  }, [chats, setChats, setActiveId, user, supabase])

  const renameChat = useCallback((chatId: string, newTitle: string) => {
    const updatedChats = chats.map(chat =>
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    )
    setChats(updatedChats)

    // Background Supabase update for authenticated users
    if (user && !chatId.startsWith('temp-') && !/^\d+$/.test(chatId)) {
      supabase
        .from('chats')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', chatId)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.error('Background Supabase update failed:', error)
        })
    }
  }, [chats, setChats, user, supabase])

  const updateChatConversation = useCallback((chatId: string, conversation: Conversation) => {
    const updatedChats = chats.map(chat =>
      chat.id === chatId ? { 
        ...chat, 
        conversation, 
        timestamp: new Date(),
        title: conversation.topic || chat.title
      } : chat
    )
    setChats(updatedChats)

    // Background Supabase update for authenticated users
    if (user && !chatId.startsWith('temp-') && !/^\d+$/.test(chatId)) {
      const updatedChat = updatedChats.find(c => c.id === chatId)
      if (updatedChat) {
        const { title, messages } = localChatToSupabase(updatedChat)
        supabase
          .from('chats')
          .update({ title, messages: messages as any, updated_at: new Date().toISOString() })
          .eq('id', chatId)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Background Supabase update failed:', error)
          })
      }
    }
  }, [chats, setChats, user, supabase])

  const addMessageToChat = useCallback((chatId: string, message: Message) => {
    const updatedChats = chats.map(chat => {
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
    
    setChats(updatedChats)

    // Background Supabase sync for authenticated users
    if (user) {
      const updatedChat = updatedChats.find(c => c.id === chatId)
      if (updatedChat) {
        if (chatId.startsWith('temp-') || /^\d+$/.test(chatId)) {
          // Save new chat to Supabase
          const { title, messages } = localChatToSupabase(updatedChat)
          supabase
            .from('chats')
            .insert({
              user_id: user.id,
              title,
              messages: messages as any,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error('Background Supabase save failed:', error)
              } else if (data) {
                // Update the chat ID in localStorage
                const newUpdatedChats = updatedChats.map(c =>
                  c.id === chatId ? { ...c, id: data.id } : c
                )
                setChats(newUpdatedChats)
                if (activeId === chatId) {
                  setActiveId(data.id)
                }
              }
            })
        } else {
          // Update existing chat in Supabase
          const { title, messages } = localChatToSupabase(updatedChat)
          supabase
            .from('chats')
            .update({ title, messages: messages as any, updated_at: new Date().toISOString() })
            .eq('id', chatId)
            .eq('user_id', user.id)
            .then(({ error }) => {
              if (error) console.error('Background Supabase update failed:', error)
            })
        }
      }
    }
  }, [chats, setChats, user, supabase, activeId, setActiveId])

  const shareChat = useCallback(async (chatId: string) => {
    if (!user) {
      throw new Error('Authentication required to share chats')
    }

    try {
      const response = await fetch('/api/share-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to share chat')
      }

      return {
        shareUrl: data.shareUrl,
        chatId: data.chatId,
        title: data.title,
      }
    } catch (error) {
      console.error('Error sharing chat:', error)
      throw error
    }
  }, [user])

  const getActiveChat = useCallback(() => {
    return chats.find(chat => chat.isActive) || null
  }, [chats])

  const clearCurrentState = useCallback(() => {
    // Clear active chat to prepare for new chat creation on first message
    const updatedChats = chats.map(chat => ({ ...chat, isActive: false }))
    setChats(updatedChats)
    setActiveId('')
  }, [chats, setChats, setActiveId])

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
    getActiveChat,
    clearCurrentState
  }
} 