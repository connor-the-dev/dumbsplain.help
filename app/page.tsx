"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { ExplanationApp } from "@/components/explanation-app"
import { ChatSidebar } from "@/components/chat-sidebar"
import { useChatHistory } from "@/hooks/use-chat-history"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  
  const {
    chats,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    shareChat,
    updateChatConversation,
    addMessageToChat,
    getActiveChat
  } = useChatHistory()

  // Detect when initial loading animation finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 3000) // Matches the loading animation duration

    return () => clearTimeout(timer)
  }, [])

  const handleNewChat = () => {
    createNewChat()
    setSidebarOpen(false)
  }

  const handleChatSelect = (chatId: string) => {
    selectChat(chatId)
    setSidebarOpen(false)
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
      <Header />
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
