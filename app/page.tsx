"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ExplanationApp } from "@/components/explanation-app"
import { ChatSidebar } from "@/components/chat-sidebar"
import { useUnifiedChats } from "@/hooks/use-unified-chats"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
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
    getActiveChat
  } = useUnifiedChats()

  // Detect when initial loading animation finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 3000) // Matches the loading animation duration

    return () => clearTimeout(timer)
  }, [])

  const handleNewChat = async () => {
    await createNewChat()
    setSidebarOpen(false)
  }

  const handleChatSelect = (chatId: string) => {
    selectChat(chatId)
    setSidebarOpen(false)
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
          onShareChat={shareChat}
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
    </main>
  )
}
