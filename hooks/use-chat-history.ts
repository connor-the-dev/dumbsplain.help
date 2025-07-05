"use client"

import { useState, useCallback } from 'react'

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

export function useChatHistory() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: Date.now().toString(),
      title: 'New Chat',
      timestamp: new Date(),
      isActive: true,
      conversation: undefined
    }
  ])

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