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
      const updatedChats = chats.map(chat => ({
        ...chat,
        isActive: chat.id === activeId
      }))
      
      // Only update if there's a change to avoid infinite loops
      const hasActiveChat = chats.some(chat => chat.isActive)
      const needsUpdate = !hasActiveChat || chats.some((chat, index) => 
        chat.isActive !== updatedChats[index].isActive
      )
      
      if (needsUpdate) {
        // If no active chat or activeId doesn't exist, make first chat active
        if (!activeId || !chats.find(chat => chat.id === activeId)) {
          updatedChats[0].isActive = true
          setActiveId(updatedChats[0].id)
        }
        setChats(updatedChats)
      }
    }
  }, [chats, activeId, setChats, setActiveId])

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

  const shareChat = useCallback((chatId: string) => {
    console.log('Sharing chat:', chatId)
  }, [])

  const getActiveChat = useCallback(() => {
    return chats.find(chat => chat.isActive) || null
  }, [chats])

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