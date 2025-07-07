"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dice5, Send, Square, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LengthSelector } from "@/components/length-selector"
import { ComplexitySlider } from "@/components/complexity-slider"
import { ExplanationDisplay } from "@/components/explanation-display"
import { QuizSection } from "@/components/quiz-section"
import { generateExplanation, generateQuiz } from "@/lib/openai"
import type { Chat } from "@/hooks/use-chat-history"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type ExplanationLength = "short" | "medium" | "long"

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

const randomTopics = [
  "Why is the sky blue?",
  "How do airplanes fly?",
  "Why do we need to sleep?",
  "How does a computer work?",
  "Why do seasons change?",
  "How do plants grow?",
  "Why do we have a moon?",
  "How do rainbows form?",
  "Why do we have different languages?",
  "How does our heart work?",
]

interface ExplanationAppProps {
  chatHistory?: Chat[]
  activeChat?: Chat | null
  onUpdateChatConversation?: (chatId: string, conversation: Conversation) => void
  onAddMessageToChat?: (chatId: string, message: Message) => void
  onCreateNewChat?: (title?: string, firstMessage?: string) => Promise<string>
}

export function ExplanationApp({ 
  chatHistory, 
  activeChat, 
  onUpdateChatConversation, 
  onAddMessageToChat,
  onCreateNewChat 
}: ExplanationAppProps) {
  const [question, setQuestion] = useState("")
  const [isExplaining, setIsExplaining] = useState(false)
  const [length, setLength] = useState<ExplanationLength>("medium")
  const [complexity, setComplexity] = useState<number>(0) // Default to simplest (5-year-old level)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  
  // Conversation-based state
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [currentTopic, setCurrentTopic] = useState<string>("")

  // Add streaming animation states
  const [streamingText, setStreamingText] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [streamTarget, setStreamTarget] = useState<string>("")

  // Add cancellation and editing states
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState<string>("")

  // Refs for textareas
  const mainTextareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomTextareaRef = useRef<HTMLTextAreaElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Load conversation when active chat changes
  useEffect(() => {
    if (activeChat?.conversation) {
      setConversation(activeChat.conversation)
      setCurrentTopic(activeChat.conversation.topic)
      setShowQuiz(false)
      setQuizQuestions([])
      setIsExplaining(false)
      setIsStreaming(false)
      setEditingIndex(null)
      setEditingText("")
    } else if (activeChat && !activeChat.conversation) {
      // Active chat exists but has no conversation (new chat)
      setConversation(null)
      setCurrentTopic("")
      setShowQuiz(false)
      setQuizQuestions([])
      setIsExplaining(false)
      setIsStreaming(false)
      setEditingIndex(null)
      setEditingText("")
    } else if (!activeChat) {
      // No active chat - clear everything (ChatGPT-style new chat)
      setConversation(null)
      setCurrentTopic("")
      setShowQuiz(false)
      setQuizQuestions([])
      setIsExplaining(false)
      setIsStreaming(false)
      setEditingIndex(null)
      setEditingText("")
    }
  }, [activeChat])

  // Effect for text streaming animation - smooth typing effect
  useEffect(() => {
    if (!isStreaming || !streamTarget) return;
    
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;
    
    const streamText = () => {
      if (currentIndex >= streamTarget.length) {
        setIsStreaming(false);
        setIsExplaining(false);
        setAbortController(null); // Clean up abort controller
        
        // Update the conversation with the full content when streaming is complete
        setConversation(prev => {
          if (!prev || prev.items.length === 0) return prev;
          
          const lastItem = prev.items[prev.items.length - 1];
          if ('isUser' in lastItem && !lastItem.isUser) {
            const updatedConversation = {
              ...prev,
              items: [
                ...prev.items.slice(0, -1),
                { isUser: false, content: streamTarget }
              ]
            };
            
            // Defer the chat history update to avoid the React warning
            setTimeout(() => {
              if (activeChat && onUpdateChatConversation) {
                onUpdateChatConversation(activeChat.id, updatedConversation);
              }
            }, 0);
            
            return updatedConversation;
          }
          
          return prev;
        });
        
        return;
      }
      
      // Calculate next chunk - prefer word boundaries for more natural flow
      let nextIndex = currentIndex + 1;
      
      // Look for word boundaries for more natural chunking
      if (currentIndex > 0 && Math.random() < 0.3) {
        const remainingText = streamTarget.substring(currentIndex);
        const nextSpace = remainingText.indexOf(' ');
        const nextPunctuation = remainingText.search(/[.!?,:;]/);
        
        if (nextSpace > 0 && nextSpace < 8) {
          nextIndex = currentIndex + nextSpace + 1;
        } else if (nextPunctuation > 0 && nextPunctuation < 12) {
          nextIndex = currentIndex + nextPunctuation + 1;
        }
      }
      
      nextIndex = Math.min(nextIndex, streamTarget.length);
      setStreamingText(streamTarget.substring(0, nextIndex));
      currentIndex = nextIndex;
      
      // Variable delay for natural typing rhythm (faster, ChatGPT-like speed)
      let delay = 12; // Base delay (faster)
      if (streamTarget[currentIndex - 1] === ' ') {
        delay = 25; // Pause at spaces
      } else if (/[.!?]/.test(streamTarget[currentIndex - 1])) {
        delay = 100; // Longer pause at sentence endings
      } else if (/[,;:]/.test(streamTarget[currentIndex - 1])) {
        delay = 50; // Medium pause at punctuation
      }
      
      // Add small random variation
      delay += Math.random() * 8 - 4;
      
      timeoutId = setTimeout(streamText, delay);
    };
    
    // Start streaming after a short delay
    timeoutId = setTimeout(streamText, 50);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isStreaming, streamTarget, activeChat, onUpdateChatConversation]);

  // Reset textarea height when question is cleared
  useEffect(() => {
    if (question === '') {
      if (mainTextareaRef.current) {
        mainTextareaRef.current.style.height = 'auto'
      }
      if (bottomTextareaRef.current) {
        bottomTextareaRef.current.style.height = 'auto'
      }
    }
  }, [question])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsExplaining(true)
    const currentQuestion = question.trim()
    
    // Create new abort controller for this request
    const controller = new AbortController()
    setAbortController(controller)
    
    try {
      if (!conversation) {
        // First question - create new conversation
        setShowQuiz(false)
        setQuizQuestions([])
        setCurrentTopic(currentQuestion)

        const newConversation = {
          items: [
            { isUser: true, content: currentQuestion }
          ],
          topic: currentQuestion
        }
        
        setConversation(newConversation)
        setQuestion("")
        
        // If no active chat exists, create a new one (ChatGPT-style behavior)
        if (!activeChat && onCreateNewChat) {
          await onCreateNewChat(currentQuestion, currentQuestion)
        }
        
        const explanation = await generateExplanation(currentQuestion, length, undefined, complexity, controller)
        
        // Add placeholder message for streaming
        const placeholderMessage: Message = { isUser: false, content: "" }
        const updatedConversation = {
          ...newConversation,
          items: [
            ...newConversation.items,
            placeholderMessage
          ]
        }
        
        setConversation(updatedConversation)
        
        // Start streaming animation
        setStreamTarget(explanation);
        setStreamingText("");
        setIsStreaming(true);
      } else {
        // Follow-up question - add to existing conversation
        const userMessage: Message = { isUser: true, content: currentQuestion }
        
        const updatedConversation = {
          ...conversation,
          items: [
            ...conversation.items,
            userMessage
          ]
        }
        setConversation(updatedConversation)
        setQuestion("")
        
        // Generate context from the conversation history
        const explanation = await generateExplanation(
          currentQuestion, 
          length, 
          conversation.items.filter(item => 'isUser' in item) as Message[],
          complexity,
          controller
        )
        
        // Add placeholder message for streaming
        const placeholderMessage: Message = { isUser: false, content: "" }
        const conversationWithPlaceholder = {
          ...updatedConversation,
          items: [
            ...updatedConversation.items,
            placeholderMessage
          ]
        }
        
        setConversation(conversationWithPlaceholder)
        
        // Start streaming animation
        setStreamTarget(explanation);
        setStreamingText("");
        setIsStreaming(true);
      }
    } catch (error) {
      console.error("Failed to generate explanation:", error)
      
      // Check if error was due to cancellation
      if (error instanceof Error && error.message === 'Request was cancelled') {
        // Remove the placeholder message if it was cancelled
        setConversation(prev => {
          if (!prev || prev.items.length === 0) return prev
          const lastItem = prev.items[prev.items.length - 1]
          if ('isUser' in lastItem && !lastItem.isUser && lastItem.content === "") {
            return {
              ...prev,
              items: prev.items.slice(0, -1)
            }
          }
          return prev
        })
        
        setIsExplaining(false)
        setIsStreaming(false)
        setAbortController(null)
        return
      }
      
      const errorMessage: Message = { isUser: false, content: "Sorry, I couldn't generate an explanation right now. Please try again later." }
      
      setConversation(prev => {
        if (!prev) return null
        const updatedConversation = {
          ...prev,
          items: [
            ...prev.items,
            errorMessage
          ]
        }
        
        // Update the chat history even for errors
        if (activeChat && onUpdateChatConversation) {
          onUpdateChatConversation(activeChat.id, updatedConversation)
        }
        
        return updatedConversation
      })
      
      // Only set isExplaining to false on error, streaming will handle it on success
      setIsExplaining(false)
    }
  }

  const handleStop = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    setIsExplaining(false)
    setIsStreaming(false)
    setIsGeneratingQuiz(false)
    setStreamTarget("")
    setStreamingText("")
  }

  const handleEditMessage = (index: number, content: string) => {
    setEditingIndex(index)
    setEditingText(content)
    
    // Focus the textarea after state update
    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.focus()
        editTextareaRef.current.setSelectionRange(content.length, content.length)
      }
    }, 0)
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingText("")
  }

  const handleSaveEdit = async () => {
    if (editingIndex === null || !conversation) return

    const newContent = editingText.trim()
    if (!newContent) return

    // Update the message in the conversation
    const updatedItems = [...conversation.items]
    const messageToEdit = updatedItems[editingIndex] as Message
    
    if (!messageToEdit.isUser) return // Only allow editing user messages
    
    messageToEdit.content = newContent
    
    // Remove all messages after the edited one (they'll be regenerated)
    const trimmedItems = updatedItems.slice(0, editingIndex + 1)
    
    const updatedConversation = {
      ...conversation,
      items: trimmedItems
    }
    
    setConversation(updatedConversation)
    setEditingIndex(null)
    setEditingText("")
    
    // Update chat history
    if (activeChat && onUpdateChatConversation) {
      onUpdateChatConversation(activeChat.id, updatedConversation)
    }
    
    // Regenerate response for the edited message
    setIsExplaining(true)
    const controller = new AbortController()
    setAbortController(controller)
    
    try {
      // Generate context from the conversation history up to the edited message
      const contextMessages = trimmedItems.filter(item => 'isUser' in item) as Message[]
      const explanation = await generateExplanation(
        newContent, 
        length, 
        contextMessages.slice(0, -1), // All messages except the current one
        complexity,
        controller
      )
      
      // Add placeholder message for streaming
      const placeholderMessage: Message = { isUser: false, content: "" }
      const conversationWithPlaceholder = {
        ...updatedConversation,
        items: [
          ...updatedConversation.items,
          placeholderMessage
        ]
      }
      
      setConversation(conversationWithPlaceholder)
      
      // Start streaming animation
      setStreamTarget(explanation);
      setStreamingText("");
      setIsStreaming(true);
    } catch (error) {
      console.error("Failed to regenerate explanation:", error)
      
      if (error instanceof Error && error.message === 'Request was cancelled') {
        setIsExplaining(false)
        setIsStreaming(false)
        setAbortController(null)
        return
      }
      
      const errorMessage: Message = { isUser: false, content: "Sorry, I couldn't regenerate the explanation. Please try again later." }
      
      setConversation(prev => {
        if (!prev) return null
        const updatedConversation = {
          ...prev,
          items: [
            ...prev.items,
            errorMessage
          ]
        }
        
        if (activeChat && onUpdateChatConversation) {
          onUpdateChatConversation(activeChat.id, updatedConversation)
        }
        
        return updatedConversation
      })
      
      setIsExplaining(false)
    }
  }

  const handleRandomTopic = () => {
    const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)]
    setQuestion(randomTopic)
    
    // Add spin animation to dice button
    const diceButton = document.querySelector('[title="Random topic"]')
    if (diceButton) {
      diceButton.classList.add('animate-spin')
      setTimeout(() => {
        diceButton.classList.remove('animate-spin')
      }, 500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const autoResize = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }, [])

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value)
    autoResize(e.target)
  }

  const handleGenerateQuiz = async () => {
    if (!conversation || conversation.items.length < 2) return
    
    setIsGeneratingQuiz(true)
    
    // Create abort controller for quiz generation
    const controller = new AbortController()
    setAbortController(controller)
    
    try {
      // Extract the entire conversation history for quiz context
      const conversationHistory = conversation.items
        .filter(item => 'isUser' in item) // Only include user messages and AI responses
        .map(item => {
          const message = item as Message;
          return `${message.isUser ? 'User' : 'AI'}: ${message.content}`;
        });
      
      // Join the entire conversation into comprehensive context
      // Recent messages have more weight by being at the end
      const fullConversationContext = conversationHistory.join("\n\n");
      
      // Get the latest topic from recent messages, or use the original topic
      const recentMessages = conversation.items
        .filter(item => 'isUser' in item && (item as Message).isUser)
        .slice(-3) // Get last 3 user messages
        .map(item => (item as Message).content);
      
      const quizTopic = recentMessages.length > 0 
        ? recentMessages[recentMessages.length - 1] // Most recent user message
        : currentTopic;
      
      const questions = await generateQuiz(quizTopic, fullConversationContext, controller)
      
      // Add quiz as a separate item in conversation
      const newQuizItem = { 
        type: 'quiz' as const,
        topic: quizTopic,
        questions,
        id: Date.now().toString()
      };
      
      setConversation(prev => {
        if (!prev) return null
        return {
          ...prev,
          items: [
            ...prev.items,
            newQuizItem
          ]
        }
      })
      setQuizQuestions(questions)
      setShowQuiz(true)
      
      // Scroll to the new quiz after a short delay
      setTimeout(() => {
        const quizElement = document.getElementById(newQuizItem.id);
        if (quizElement) {
          quizElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        } else {
          // Fallback: scroll to bottom
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
      
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      
      if (error instanceof Error && error.message === 'Request was cancelled') {
        // Just clean up state for cancelled requests
        setIsGeneratingQuiz(false)
        setAbortController(null)
        return
      }
      
      // Show an error to the user
      setConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          items: [
            ...prev.items,
            { 
              isUser: false, 
              content: "Sorry, I had trouble creating a quiz. Please try again." 
            }
          ]
        };
      });
    } finally {
      setIsGeneratingQuiz(false);
      setAbortController(null)
    }
  }
  
  const renderColoredText = (text: string) => {
    return text
      .replace(/<blue>(.*?)<\/blue>/g, '<span class="text-blue-400">$1</span>')
      .replace(/<red>(.*?)<\/red>/g, '<span class="text-red-400">$1</span>')
      .replace(/<yellow>(.*?)<\/yellow>/g, '<span class="text-yellow-400">$1</span>');
  };

  // Custom cursor component for more realistic text streaming
  const BlinkingCursor = () => (
    <span className="inline-block w-0.5 h-5 bg-blue-400 ml-0.5 align-text-bottom animate-pulse"></span>
  );

  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col flex-1 relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-6 py-8">
          {!conversation ? (
            // Initial centered layout
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
              <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold text-white">What would you like to understand?</h1>
              </div>
              
              {/* Centered Input Form */}
              <motion.div
                key="centered-form"
                className="w-full max-w-2xl space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Controls Row */}
                  <div className={cn("flex items-center justify-center text-sm", isMobile ? "gap-3" : "gap-6")}>
                    <LengthSelector value={length} onChange={setLength} compact />
                    {!isMobile && <div className="h-5 w-px bg-gray-700" />}
                    <ComplexitySlider value={complexity} onChange={setComplexity} compact />
                  </div>
                  
                  {/* Input Row */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleRandomTopic}
                      title="Random topic"
                      disabled={isExplaining}
                      className="rounded-xl hover:rotate-180 transition-transform duration-500 hover:border-yellow-500 hover:text-yellow-500 shrink-0 h-12 w-12"
                    >
                      <Dice5 className="h-4 w-4" />
                    </Button>
                    
                    <Textarea
                      ref={mainTextareaRef}
                      value={question}
                      onChange={handleQuestionChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask any question..."
                      disabled={isExplaining}
                      className="flex-1 rounded-xl min-h-12 max-h-32 text-base resize-none overflow-y-auto"
                      rows={1}
                      style={{ 
                        paddingTop: '0.875rem', 
                        paddingBottom: '0.875rem',
                        lineHeight: '1.25rem'
                      }}
                    />
                    
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!question.trim() || isExplaining}
                      className="bg-yellow-500 hover:bg-yellow-600 rounded-xl text-gray-900 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-110 transition-all duration-300 shrink-0 h-12 w-12"
                    >
                      {isExplaining ? (
                        <div className="animate-spin">
                          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full" />
                        </div>
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                    
                    {/* Stop button when AI is generating */}
                    {isExplaining && (
                      <Button 
                        type="button" 
                        size="icon"
                        onClick={handleStop}
                        className="bg-red-500 hover:bg-red-600 rounded-xl text-white hover:shadow-lg hover:shadow-red-500/30 hover:scale-110 transition-all duration-300 shrink-0 h-12 w-12"
                      >
                        <Square className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </form>
              </motion.div>
            </div>
          ) : (
            // Conversation layout with proper spacing
            <div className="pb-40">
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {/* Conversation-style UI */}
                  {conversation.items.map((item, index) => {
                    if ('type' in item && item.type === 'quiz') {
                      // Render quiz item
                      return (
                        <motion.div
                          key={item.id}
                          id={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="w-full"
                        >
                          <QuizSection 
                            topic={item.topic}
                            questions={item.questions}
                            isCollapsible={true}
                            defaultCollapsed={false}
                            onNewQuiz={() => {
                              setShowQuiz(false);
                              handleGenerateQuiz();
                            }}
                          />
                        </motion.div>
                      )
                    } else {
                      // Render message item
                      const message = item as Message;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className={`${
                            message.isUser 
                              ? "bg-blue-600 text-white ml-auto rounded-tl-xl rounded-bl-xl rounded-tr-xl" 
                              : "bg-gray-800 text-gray-100 mr-auto rounded-tr-xl rounded-br-xl rounded-tl-xl"
                          } p-6 max-w-[80%] rounded-xl shadow-lg group relative`}
                        >
                          {/* Edit button for user messages */}
                          {message.isUser && editingIndex !== index && !isExplaining && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditMessage(index, message.content)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 text-white h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {editingIndex === index ? (
                            // Edit interface
                            <div className="space-y-3">
                                                             <Textarea
                                 ref={editTextareaRef}
                                 value={editingText}
                                 onChange={(e) => setEditingText(e.target.value)}
                                 className="w-full bg-white/10 border-white/20 text-white resize-none rounded-xl"
                                 rows={Math.min(Math.max(editingText.split('\n').length, 3), 8)}
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter' && e.ctrlKey) {
                                     handleSaveEdit()
                                   } else if (e.key === 'Escape') {
                                     handleCancelEdit()
                                   }
                                 }}
                               />
                                                             <div className="flex gap-2">
                                 <Button
                                   size="sm"
                                   onClick={handleSaveEdit}
                                   className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 h-8 px-3 rounded-xl"
                                 >
                                   <Check className="h-4 w-4 mr-1" />
                                   Save
                                 </Button>
                                 <Button
                                   size="sm"
                                   onClick={handleCancelEdit}
                                   className="bg-red-500 hover:bg-red-600 text-white h-8 px-3 rounded-xl"
                                 >
                                   <X className="h-4 w-4 mr-1" />
                                   Cancel
                                 </Button>
                               </div>
                            </div>
                          ) : (
                            // Normal message display
                            <div className="whitespace-pre-wrap">
                              {message.isUser ? message.content : (
                                index === conversation.items.length - 1 && isStreaming && !message.isUser
                                  ? <>
                                      <span dangerouslySetInnerHTML={{ __html: renderColoredText(streamingText) }} />
                                      <BlinkingCursor />
                                    </>
                                  : <span dangerouslySetInnerHTML={{ __html: renderColoredText(message.content) }} />
                              )}
                            </div>
                          )}
                        </motion.div>
                      )
                    }
                  })}
                  
                  {/* Loading state for initial explanation - only show when thinking, not when streaming */}
                  {isExplaining && !isStreaming && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800 text-gray-100 mr-auto p-6 max-w-[80%] rounded-tr-xl rounded-br-xl rounded-tl-xl shadow-lg"
                    >
                      <div className="flex space-x-2">
                        <div className="bg-red-500 rounded-full h-3 w-3 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="bg-blue-500 rounded-full h-3 w-3 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="bg-yellow-500 rounded-full h-3 w-3 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </motion.div>
                  )}

                  {/* Follow-up question and quiz section */}
                  {!isExplaining && conversation.items.length >= 2 && (
                    <div className="space-y-8 mt-8">
                      {!showQuiz ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="flex justify-center gap-3"
                        >
                          <Button
                            onClick={handleGenerateQuiz}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-full px-8 py-3 hover:shadow-lg hover:shadow-red-500/50 button-shimmer"
                            disabled={isGeneratingQuiz}
                          >
                            {isGeneratingQuiz ? "Generating Quiz..." : "Generate a Mini Quiz"}
                          </Button>
                          
                          {/* Stop button for quiz generation */}
                          {isGeneratingQuiz && (
                            <Button
                              type="button"
                              size="icon"
                              onClick={handleStop}
                              className="bg-red-700 hover:bg-red-800 text-white rounded-full h-12 w-12 hover:shadow-lg hover:shadow-red-700/50 hover:scale-110 transition-all duration-300"
                            >
                              <Square className="h-5 w-5" />
                            </Button>
                          )}
                        </motion.div>
                      ) : null}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Input Bar - Only show when conversation exists */}
      <AnimatePresence>
        {conversation && (
          <motion.div
            key="bottom-form"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.6 
            }}
            className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 p-4 shadow-xl"
          >
            <div className="container max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className={cn("space-y-3", isMobile && "space-y-2")}>
                {/* Controls Row */}
                <div className={cn("flex items-center text-sm", 
                  isMobile ? "justify-center gap-4 -ml-4" : "gap-6"
                )}>
                  <LengthSelector value={length} onChange={setLength} compact />
                  {!isMobile && <div className="h-4 w-px bg-gray-700" />}
                  <ComplexitySlider value={complexity} onChange={setComplexity} compact />
                </div>
                
                {/* Input Row */}
                <div className={cn("flex", isMobile ? "gap-2" : "gap-3")}>
                  <Textarea
                    ref={bottomTextareaRef}
                    value={question}
                    onChange={handleQuestionChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a follow up"
                    disabled={isExplaining}
                    className="flex-1 rounded-xl min-h-10 max-h-32 resize-none overflow-y-auto"
                    rows={1}
                    style={{ 
                      paddingTop: '0.625rem', 
                      paddingBottom: '0.625rem',
                      lineHeight: '1.25rem'
                    }}
                  />
                  
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!question.trim() || isExplaining}
                    className={cn("bg-yellow-500 hover:bg-yellow-600 rounded-xl text-gray-900 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-110 transition-all duration-300 shrink-0",
                      isMobile && "w-10 h-10"
                    )}
                  >
                    {isExplaining ? (
                      <div className="animate-spin">
                        <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full" />
                      </div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Stop button when AI is generating */}
                  {isExplaining && (
                    <Button 
                      type="button" 
                      size="icon"
                      onClick={handleStop}
                      className={cn("bg-red-500 hover:bg-red-600 rounded-xl text-white hover:shadow-lg hover:shadow-red-500/30 hover:scale-110 transition-all duration-300 shrink-0",
                        isMobile && "w-10 h-10"
                      )}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper function to generate dummy explanations
function generateDummyExplanation(question: string, length: ExplanationLength): string {
  const shortExplanation = `
    Great question! ${question.replace(/\?$/, "")}? 
    
    Think of it like this: the world is full of amazing things that work in special ways. 
    
    This happens because of tiny parts we can't see that move and work together, kind of like how your toys have pieces that fit together.
    
    It's a bit like when you build with blocks - each piece has a job to do!
  `

  const mediumExplanation = `
    Great question! ${question.replace(/\?$/, "")}?
    
    Think of it like this: the world is full of amazing things that work in special ways. 
    
    This happens because of tiny parts we can't see that move and work together, kind of like how your toys have pieces that fit together.
    
    It's a bit like when you build with blocks - each piece has a job to do!
    
    Scientists have studied this for many years and discovered how these tiny parts work. They use special tools to see things that are too small for our eyes.
    
    It's like having a super power to see the hidden magic that makes our world work!
  `

  const longExplanation = `
    Great question! ${question.replace(/\?$/, "")}?
    
    Think of it like this: the world is full of amazing things that work in special ways. 
    
    This happens because of tiny parts we can't see that move and work together, kind of like how your toys have pieces that fit together.
    
    It's a bit like when you build with blocks - each piece has a job to do!
    
    Scientists have studied this for many years and discovered how these tiny parts work. They use special tools to see things that are too small for our eyes.
    
    It's like having a super power to see the hidden magic that makes our world work!
    
    The really cool thing is that everything around us - from trees to cars to your own body - follows these same special rules. They're like the rules of a game that everything in the universe plays by.
    
    When we understand these rules, we can make new things and solve problems. That's what makes learning so exciting - the more we know, the more amazing things we can do!
    
    Does that make sense? What part would you like to know more about?
  `

  switch (length) {
    case "short":
      return shortExplanation.trim()
    case "medium":
      return mediumExplanation.trim()
    case "long":
      return longExplanation.trim()
    default:
      return mediumExplanation.trim()
  }
}
