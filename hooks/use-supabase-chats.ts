import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useAuth } from '@/lib/auth-context'

type Chat = Database['public']['Tables']['chats']['Row']
type ChatInsert = Database['public']['Tables']['chats']['Insert']
type ChatUpdate = Database['public']['Tables']['chats']['Update']

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export function useSupabaseChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClientSupabase()

  useEffect(() => {
    if (user) {
      fetchChats()
    } else {
      setChats([])
      setLoading(false)
    }
  }, [user])

  const fetchChats = async () => {
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

      setChats(data || [])
    } catch (error) {
      console.error('Error fetching chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const createChat = async (title: string, messages: Message[] = []) => {
    if (!user) return null

    try {
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
        console.error('Error creating chat:', error)
        return null
      }

      setChats(prev => [data, ...prev])
      return data
    } catch (error) {
      console.error('Error creating chat:', error)
      return null
    }
  }

  const updateChat = async (chatId: string, updates: Partial<ChatUpdate>) => {
    if (!user) return null

    try {
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
        console.error('Error updating chat:', error)
        return null
      }

      setChats(prev => prev.map(chat => 
        chat.id === chatId ? data : chat
      ))
      return data
    } catch (error) {
      console.error('Error updating chat:', error)
      return null
    }
  }

  const deleteChat = async (chatId: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting chat:', error)
        return false
      }

      setChats(prev => prev.filter(chat => chat.id !== chatId))
      return true
    } catch (error) {
      console.error('Error deleting chat:', error)
      return false
    }
  }

  const addMessageToChat = async (chatId: string, message: Message) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return null

    const currentMessages = Array.isArray(chat.messages) ? chat.messages : []
    const updatedMessages = [...currentMessages, message]

    return await updateChat(chatId, { messages: updatedMessages as any })
  }

  return {
    chats,
    loading,
    createChat,
    updateChat,
    deleteChat,
    addMessageToChat,
    refetch: fetchChats
  }
} 