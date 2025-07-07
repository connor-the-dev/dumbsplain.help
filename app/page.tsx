"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ExplanationApp } from "@/components/explanation-app"
import { ChatSidebar } from "@/components/chat-sidebar"
import { SharePopup } from "@/components/share-popup"
import { useUnifiedChats } from "@/hooks/use-unified-chats"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [sharePopupOpen, setSharePopupOpen] = useState(false)
  const [shareData, setShareData] = useState({
    shareUrl: '',
    chatTitle: '',
    isLoading: false,
    error: ''
  })
  
  const {
    chats,
    loading,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    shareChat,
    updateChatConversation,
    addMessageToChat,
    getActiveChat,
    clearCurrentState
  } = useUnifiedChats()

  // Detect when initial loading animation finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 3000) // Matches the loading animation duration

    return () => clearTimeout(timer)
  }, [])

  const handleNewChat = () => {
    clearCurrentState()
    setSidebarOpen(false)
  }

  const handleChatSelect = (chatId: string) => {
    selectChat(chatId)
    setSidebarOpen(false)
  }

  const handleShareChat = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat) return

    setShareData({
      shareUrl: '',
      chatTitle: chat.title,
      isLoading: true,
      error: ''
    })
    setSharePopupOpen(true)

    try {
      const result = await shareChat(chatId)
      setShareData(prev => ({
        ...prev,
        shareUrl: result.shareUrl,
        isLoading: false,
        error: ''
      }))
    } catch (error) {
      setShareData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to share chat'
      }))
    }
  }

  // Show loading state while fetching chats
  if (loading && !isInitialLoading) {
    return (
      <main className="flex flex-col h-screen bg-gray-950 items-center justify-center">
        <div className="flex space-x-2">
          <div className="bg-red-500 rounded-full h-3 w-3 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="bg-blue-500 rounded-full h-3 w-3 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="bg-yellow-500 rounded-full h-3 w-3 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="text-gray-400 mt-4">Loading your chats...</p>
      </main>
    )
  }

  return (
    <main className="flex flex-col h-screen bg-gray-950">
      {!isInitialLoading && (
        <ChatSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          chats={chats}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onShareChat={handleShareChat}
        />
      )}
      <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      <ExplanationApp 
        chatHistory={chats}
        activeChat={getActiveChat()}
        onUpdateChatConversation={updateChatConversation}
        onAddMessageToChat={addMessageToChat}
        onCreateNewChat={createNewChat}
      />
      <SharePopup
        isOpen={sharePopupOpen}
        onClose={() => setSharePopupOpen(false)}
        shareUrl={shareData.shareUrl}
        chatTitle={shareData.chatTitle}
        isLoading={shareData.isLoading}
        error={shareData.error}
      />
    </main>
  )
}
