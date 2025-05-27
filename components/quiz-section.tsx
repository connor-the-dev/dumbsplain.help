"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Repeat } from "lucide-react"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number // Changed from correctIndex to match OpenAI's output format
}

interface QuizSectionProps {
  topic: string
  questions?: QuizQuestion[]
  onNewQuiz?: () => void
}

export function QuizSection({ topic, questions: propQuestions, onNewQuiz }: QuizSectionProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (propQuestions && propQuestions.length > 0) {
      // Create a deep copy of the questions to work with
      const questionsToShuffle = JSON.parse(JSON.stringify(propQuestions));
      
      // Shuffle the order of the questions
      const shuffledQuestions = [...questionsToShuffle].sort(() => Math.random() - 0.5);
      
      // For each question, shuffle the options while preserving the correct answer
      const fullyShuffledQuestions = shuffledQuestions.map(question => {
        // Create arrays of options and their status (correct or not)
        const options = [...question.options];
        const correctOption = options[question.correctAnswer];
        
        // Shuffle the options
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
        
        // Find the new index of the correct answer
        const newCorrectIndex = shuffledOptions.findIndex(option => option === correctOption);
        
        // Return the question with shuffled options and updated correct answer index
        return {
          ...question,
          options: shuffledOptions,
          correctAnswer: newCorrectIndex
        };
      });
      
      setQuestions(fullyShuffledQuestions);
      setIsLoading(false);
    } else {
      // Fallback to dummy questions if no questions provided
      setTimeout(() => {
        setQuestions(generateDummyQuiz(topic))
        setIsLoading(false)
      }, 1500)
    }
  }, [topic, propQuestions])

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return // Prevent changing answer

    setSelectedOption(index)

    if (index === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedOption(null)
      } else {
        setQuizComplete(true)
      }
    }, 1500)
  }

  const handleRestartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedOption(null)
    setScore(0)
    setQuizComplete(false)
    
    // Generate new questions by setting a loading state
    setIsLoading(true)
    
    // Use the existing propQuestions if provided, or generate new dummy questions
    if (propQuestions && propQuestions.length > 0) {
      // Create a deep copy of the questions to work with
      const questionsToShuffle = JSON.parse(JSON.stringify(propQuestions));
      
      // Shuffle the order of the questions
      const shuffledQuestions = [...questionsToShuffle].sort(() => Math.random() - 0.5);
      
      // For each question, shuffle the order of the options while preserving the correct answer
      const fullyShuffledQuestions = shuffledQuestions.map(question => {
        // Create arrays of options and their status (correct or not)
        const options = [...question.options];
        const correctOption = options[question.correctAnswer];
        
        // Shuffle the options
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
        
        // Find the new index of the correct answer
        const newCorrectIndex = shuffledOptions.findIndex(option => option === correctOption);
        
        // Return the question with shuffled options and updated correct answer index
        return {
          ...question,
          options: shuffledOptions,
          correctAnswer: newCorrectIndex
        };
      });
      
      setQuestions(fullyShuffledQuestions);
      setIsLoading(false);
    } else {
      // Generate new dummy questions
      setTimeout(() => {
        setQuestions(generateDummyQuiz(topic))
        setIsLoading(false)
      }, 1000)
    }
  }
  
  const handleNewQuiz = () => {
    if (onNewQuiz) {
      onNewQuiz();
    } else {
      handleRestartQuiz();
    }
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg text-center"
      >
        <div className="py-8">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {["bg-red-500", "bg-blue-500", "bg-yellow-500"].map((color, i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-full ${color}`}
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-300">Creating your mini quiz...</p>
        </div>
      </motion.div>
    )
  }

  if (!questions.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg text-center"
      >
        <p className="text-gray-300">Couldn't generate quiz questions. Please try again.</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg"
    >
      <h3 className="text-lg font-bold mb-6 text-center text-yellow-400">Mini Quiz Time!</h3>

      {!quizComplete ? (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-400">Score: {score}</span>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-medium mb-4 text-gray-200">{questions[currentQuestion].question}</h4>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedOption === null
                      ? "border-gray-700 hover:border-gray-600 bg-gray-800/50 hover:bg-gray-800"
                      : selectedOption === index
                        ? index === questions[currentQuestion].correctAnswer
                          ? "border-green-500 bg-green-500/20"
                          : "border-red-500 bg-red-500/20"
                        : index === questions[currentQuestion].correctAnswer
                          ? "border-green-500 bg-green-500/20"
                          : "border-gray-700 bg-gray-800/50 opacity-50"
                  }`}
                  disabled={selectedOption !== null}
                  whileHover={selectedOption === null ? { scale: 1.02 } : {}}
                  whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-200">{option}</span>
                    {selectedOption !== null &&
                      (index === questions[currentQuestion].correctAnswer ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : selectedOption === index ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : null)}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
          <h4 className="text-xl font-bold mb-2 text-gray-200">Quiz Complete!</h4>
          <p className="text-lg mb-6">
            Your score: <span className="font-bold text-yellow-400">{score}</span> out of {questions.length}
          </p>

          {score === questions.length ? (
            <p className="text-green-400 mb-6">Perfect score! You're super smart!</p>
          ) : score >= questions.length / 2 ? (
            <p className="text-blue-400 mb-6">Good job! You learned a lot!</p>
          ) : (
            <p className="text-red-400 mb-6">Keep learning! You'll get better!</p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleRestartQuiz}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full px-6 py-2 flex items-center gap-2 justify-center hover:shadow-lg hover:shadow-blue-500/50 button-shimmer"
            >
              <Repeat className="h-4 w-4" />
              <span>Retry This Quiz</span>
            </Button>

            <Button
              onClick={handleNewQuiz}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-full px-6 py-2 hover:shadow-lg hover:shadow-yellow-500/50 button-shimmer"
            >
              Try New Quiz
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Helper function to generate dummy quiz questions
function generateDummyQuiz(topic: string): QuizQuestion[] {
  // Create dummy questions with randomized correct answers
  const questions = [
    {
      question: `What is the main idea about ${topic.replace(/\?$/, "")}?`,
      options: [
        "It's something very complicated",
        "It's a simple concept that happens naturally",
        "It's only found in outer space",
        "It's a made-up story",
      ],
      correctAnswer: 1,
    },
    {
      question: "Which of these is true?",
      options: [
        "Things work together like puzzle pieces",
        "Nothing is connected to anything else",
        "Only adults can understand this topic",
        "This topic changes every day",
      ],
      correctAnswer: 0,
    },
    {
      question: "Why is learning about this important?",
      options: [
        "It's not important at all",
        "Only scientists need to know this",
        "It helps us understand how our world works",
        "It's only in books, not real life",
      ],
      correctAnswer: 2,
    },
  ];
  
  // Randomize which option is correct for each question
  return questions.map(question => {
    // Create arrays of options and remember which one is correct
    const options = [...question.options];
    const correctOption = options[question.correctAnswer];
    
    // Shuffle the options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    // Find the new index of the correct answer
    const newCorrectIndex = shuffledOptions.findIndex(option => option === correctOption);
    
    // Return the question with shuffled options and updated correct answer index
    return {
      ...question,
      options: shuffledOptions,
      correctAnswer: newCorrectIndex
    };
  });
}
