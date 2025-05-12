"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dice5, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LengthSelector } from "@/components/length-selector"
import { ComplexitySlider } from "@/components/complexity-slider"
import { ExplanationDisplay } from "@/components/explanation-display"
import { FollowUpQuestion } from "@/components/follow-up-question"
import { QuizSection } from "@/components/quiz-section"
import { generateExplanation, generateQuiz } from "@/lib/openai"

type ExplanationLength = "short" | "medium" | "long"

// Define conversation types
interface Message {
  isUser: boolean;
  content: string;
}

interface Conversation {
  messages: Message[];
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

export function ExplanationApp() {
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
  
  // Separate loading state for follow-up questions
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false)

  // Add streaming animation states
  const [streamingText, setStreamingText] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [streamTarget, setStreamTarget] = useState<string>("")

  // Effect for text streaming animation - updated for smooth flow
  useEffect(() => {
    if (!isStreaming || !streamTarget) return;
    
    let i = 0;
    let lastUpdateTime = Date.now();

    const getRandomDelay = () => {
      // Occasionally add a longer pause (like a person thinking)
      if (Math.random() < 0.05) {
        return Math.floor(Math.random() * 300) + 100; // 100-400ms pause
      }
      
      // Normal typing rate with natural variation
      return Math.floor(Math.random() * 20) + 10; // 10-30ms
    };

    const getRandomChunkSize = () => {
      // Occasionally type a larger chunk (like a burst of typing)
      if (Math.random() < 0.1) {
        return Math.floor(Math.random() * 5) + 2; // 2-6 characters
      }
      
      // Normal typing size with variation
      return Math.floor(Math.random() * 2) + 1; // 1-2 characters
    };

    const updateText = () => {
      if (i >= streamTarget.length) {
        setIsStreaming(false);
        return;
      }
      
      const now = Date.now();
      const elapsed = now - lastUpdateTime;
      const delay = getRandomDelay();
      
      if (elapsed < delay) {
        requestAnimationFrame(updateText);
        return;
      }
      
      // Update the text with a random chunk size
      const chunkSize = getRandomChunkSize();
      const nextIndex = Math.min(i + chunkSize, streamTarget.length);
      setStreamingText(streamTarget.substring(0, nextIndex));
      i = nextIndex;
      lastUpdateTime = now;
      
      requestAnimationFrame(updateText);
    };
    
    requestAnimationFrame(updateText);
    
    return () => {
      i = streamTarget.length; // Force exit on cleanup
    };
  }, [isStreaming, streamTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsExplaining(true)
    setShowQuiz(false)
    setQuizQuestions([])
    
    // Store the current question for later use
    const currentQuestion = question.trim()
    setCurrentTopic(currentQuestion)

    try {
      // Create a new conversation with the user's question
      setConversation({
        messages: [
          { isUser: true, content: currentQuestion }
        ],
        topic: currentQuestion
      })
      
      // Clear the input field
      setQuestion("")
      
      // Generate the explanation - now passing complexity
      const explanation = await generateExplanation(currentQuestion, length, undefined, complexity)
      
      // Set up streaming animation
      setStreamTarget(explanation);
      setStreamingText("");
      setIsStreaming(true);
      
      // Add the assistant's response to the conversation
      setConversation(prev => {
        if (!prev) return null
        return {
          ...prev,
          messages: [
            ...prev.messages,
            { isUser: false, content: explanation, streaming: true }
          ]
        }
      })
    } catch (error) {
      console.error("Failed to generate explanation:", error)
      setConversation(prev => {
        if (!prev) return null
        return {
          ...prev,
          messages: [
            ...prev.messages,
            { isUser: false, content: "Sorry, I couldn't generate an explanation right now. Please try again later." }
          ]
        }
      })
    } finally {
      setIsExplaining(false)
    }
  }

  const handleRandomTopic = () => {
    const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)]
    setQuestion(randomTopic)
  }

  const handleGenerateQuiz = async () => {
    if (!conversation || conversation.messages.length < 2) return
    
    setIsGeneratingQuiz(true)
    
    try {
      // Extract all AI responses from the conversation for quiz context
      const aiResponses = conversation.messages
        .filter(msg => !msg.isUser)
        .map(msg => msg.content);
      
      // Join all AI responses into a single comprehensive explanation
      const fullExplanation = aiResponses.join("\n\n");
      
      // Use the combined explanation for quiz generation
      const questions = await generateQuiz(currentTopic, fullExplanation);
      
      // Check if we received valid questions
      if (questions && Array.isArray(questions) && questions.length > 0) {
        setQuizQuestions(questions);
        setShowQuiz(true);
      } else {
        console.error('Received invalid quiz questions:', questions);
        // Show an error to the user
        setConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [
              ...prev.messages,
              { 
                isUser: false, 
                content: "I couldn't generate a quiz based on our conversation. Could you ask me to explain more about this topic first?" 
              }
            ]
          };
        });
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      // Show an error to the user
      setConversation(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            { 
              isUser: false, 
              content: "Sorry, I had trouble creating a quiz. Please try again." 
            }
          ]
        };
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  }
  
  const handleFollowUpSubmit = async (followUpQuestion: string) => {
    if (!conversation) return
    
    // Set loading state specifically for follow-up
    setIsLoadingFollowUp(true)
    
    // Add the follow-up question to the conversation
    setConversation(prev => {
      if (!prev) return null
      return {
        ...prev,
        messages: [
          ...prev.messages,
          { isUser: true, content: followUpQuestion }
        ]
      }
    })
    
    try {
      // Get the current conversation messages to provide context
      // We need to create a new array because we just updated the state above
      // but React hasn't re-rendered yet
      const currentMessages = conversation.messages.concat([
        { isUser: true, content: followUpQuestion }
      ]);
      
      // Generate the response to the follow-up question, passing conversation history
      const response = await generateExplanation(followUpQuestion, length, currentMessages, complexity);
      
      // Set up streaming animation
      setStreamTarget(response);
      setStreamingText("");
      setIsStreaming(true);
      
      // Add the assistant's response to the conversation
      setConversation(prev => {
        if (!prev) return null
        return {
          ...prev,
          messages: [
            ...prev.messages,
            { isUser: false, content: response, streaming: true }
          ]
        }
      })
    } catch (error) {
      console.error("Failed to generate follow-up explanation:", error)
      setConversation(prev => {
        if (!prev) return null
        return {
          ...prev,
          messages: [
            ...prev.messages,
            { isUser: false, content: "Sorry, I couldn't generate a response right now. Please try again later." }
          ]
        }
      })
    } finally {
      setIsLoadingFollowUp(false)
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
    <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse-fast ml-0.5 align-middle"></span>
  );

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask any question..."
                disabled={isExplaining}
                className="w-full rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleRandomTopic}
                title="Random topic"
                disabled={isExplaining}
                className="rounded-xl"
              >
                <Dice5 className="h-5 w-5" />
              </Button>
              <Button 
                type="submit" 
                disabled={!question.trim() || isExplaining}
                className="bg-yellow-500 hover:bg-yellow-600 rounded-xl text-gray-900"
              >
                {isExplaining ? (
                  <div className="flex items-center gap-1">
                    <span className="animate-pulse">Thinking</span>
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                    <span className="animate-bounce delay-300">.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Explain</span>
                    <Send className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <LengthSelector value={length} onChange={setLength} />
            </div>
            <div className="flex-1">
              <ComplexitySlider value={complexity} onChange={setComplexity} />
            </div>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {(isExplaining || conversation) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Conversation-style UI */}
            {conversation && conversation.messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`${
                  message.isUser 
                    ? "bg-blue-600 text-white ml-auto rounded-tl-xl rounded-bl-xl rounded-tr-xl" 
                    : "bg-gray-800 text-gray-100 mr-auto rounded-tr-xl rounded-br-xl rounded-tl-xl"
                } p-4 max-w-[80%] rounded-xl`}
              >
                <div className="whitespace-pre-wrap">
                  {message.isUser ? message.content : (
                    index === conversation.messages.length - 1 && isStreaming && !message.isUser
                      ? <>
                          <span dangerouslySetInnerHTML={{ __html: renderColoredText(streamingText) }} />
                          <BlinkingCursor />
                        </>
                      : <span dangerouslySetInnerHTML={{ __html: renderColoredText(message.content) }} />
                  )}
                  {index === conversation.messages.length - 1 && isStreaming && !message.isUser && (
                    <span className="animate-pulse">▋</span>
                  )}
                </div>
                
                {/* Show loading indicator for the latest assistant message if we're loading a follow-up */}
                {isLoadingFollowUp && index === conversation.messages.length - 1 && !message.isUser && (
                  <div className="mt-2 flex space-x-1">
                    <div className="bg-red-500 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="bg-blue-500 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="bg-yellow-500 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* Loading state for initial explanation */}
            {isExplaining && !isLoadingFollowUp && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 text-gray-100 mr-auto p-4 max-w-[80%] rounded-tr-xl rounded-br-xl rounded-tl-xl"
              >
                <div className="flex space-x-2">
                  <div className="bg-red-500 rounded-full h-3 w-3 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="bg-blue-500 rounded-full h-3 w-3 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="bg-yellow-500 rounded-full h-3 w-3 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}

            {/* Follow-up question and quiz section */}
            {conversation && !isExplaining && conversation.messages.length >= 2 && (
              <div className="space-y-6 mt-4">
                <FollowUpQuestion
                  onSubmit={handleFollowUpSubmit}
                  isLoading={isLoadingFollowUp}
                />

                {!showQuiz ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center"
                  >
                    <Button
                      onClick={handleGenerateQuiz}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-full px-6 py-2"
                      disabled={isGeneratingQuiz}
                    >
                      {isGeneratingQuiz ? "Generating Quiz..." : "Generate a Mini Quiz"}
                    </Button>
                  </motion.div>
                ) : (
                  <QuizSection 
                    topic={currentTopic} 
                    questions={quizQuestions} 
                    onNewQuiz={() => {
                      setShowQuiz(false);
                      handleGenerateQuiz();
                    }}
                  />
                )}
              </div>
            )}
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
