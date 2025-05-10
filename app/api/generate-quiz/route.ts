import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Define the question interface
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  correctIndex?: number; // Some responses might use this format
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  let topic = "this subject";
  let explanation = "";
  
  try {
    // Parse the request body once at the beginning
    const requestData = await request.json();
    topic = requestData.topic || "this subject";
    explanation = requestData.explanation || "";

    if (!topic || !explanation) {
      return NextResponse.json({ error: 'Topic and explanation are required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are an educational quiz creator specializing in creating quizzes for children.
          Create 3 multiple-choice questions based STRICTLY on the provided explanation.
          Each question should have 4 options with only one correct answer.
          Make the questions fun, engaging, and DIRECTLY related to the SPECIFIC content in the explanation.
          DO NOT invent information not present in the explanation.
          Questions should test understanding of key concepts that are explicitly mentioned in the explanation.
          IMPORTANTLY: Make sure the correct answers are randomly distributed - don't always make "A" the correct answer.
          Structure your response as a JSON array within a "questions" property.`
        },
        {
          role: "user",
          content: `Topic: ${topic}\n\nExplanation: ${explanation}\n\nCreate 3 simple multiple-choice questions based ONLY on information in this explanation. 
          
          The questions should test understanding of the main concepts that are explicitly stated in the text.
          
          Return your response as a JSON object with the following structure: 
          {
            "questions": [
              {
                "question": "Question text?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0
              },
              ...
            ]
          }
          
          Where correctAnswer is the index (0-3) of the correct option.
          IMPORTANT: Make sure to randomize which option is correct (don't always make index 0 correct).
          Make sure the JSON format is valid.`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const jsonContent = response.choices[0].message.content || "";
    let parsedQuiz;
    
    try {
      parsedQuiz = JSON.parse(jsonContent);
      
      // Check if we have a valid questions array
      if (parsedQuiz.questions && Array.isArray(parsedQuiz.questions) && parsedQuiz.questions.length > 0) {
        // Validate each question has the required properties
        const validQuestions = parsedQuiz.questions.filter((q: any) => 
          q.question && 
          Array.isArray(q.options) && 
          q.options.length === 4 &&
          typeof q.correctAnswer === 'number' &&
          q.correctAnswer >= 0 && 
          q.correctAnswer < 4
        );
        
        if (validQuestions.length > 0) {
          return NextResponse.json({ questions: validQuestions });
        }
        
        // Fallback to generating placeholder questions if validation failed
        return NextResponse.json({ 
          questions: generateFallbackQuestions(topic)
        });
      }
      
      // If the structure isn't as expected, try to extract questions from other formats
      if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0) {
        const validQuestions = parsedQuiz.filter((q: any) => 
          q.question && 
          Array.isArray(q.options) && 
          q.options.length > 0 &&
          (typeof q.correctAnswer === 'number' || typeof q.correctIndex === 'number')
        );
        
        if (validQuestions.length > 0) {
          // Normalize the questions to ensure they have correctAnswer property
          const normalizedQuestions = validQuestions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : q.correctIndex
          }));
          
          return NextResponse.json({ questions: normalizedQuestions });
        }
      }
      
      // If we got here, we couldn't extract valid questions
      return NextResponse.json({ 
        questions: generateFallbackQuestions(topic)
      });
    } catch (parseError) {
      console.error('Error parsing quiz JSON:', parseError);
      return NextResponse.json({ 
        questions: generateFallbackQuestions(topic),
        error: 'Failed to parse quiz'
      });
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ 
      questions: generateFallbackQuestions(topic),
      error: 'Failed to generate quiz'
    });
  }
}

// Generate fallback questions if the AI response fails
function generateFallbackQuestions(topic: string): QuizQuestion[] {
  return [
    {
      question: `What is the main concept related to ${topic}?`,
      options: [
        "Understanding how things work together",
        "Memorizing complex details",
        "Ignoring scientific explanations",
        "Only focusing on historical facts"
      ],
      correctAnswer: 0
    },
    {
      question: "Which approach helps us better understand concepts?",
      options: [
        "Ignoring the details",
        "Looking at how parts connect and work together",
        "Only focusing on one small part",
        "Avoiding scientific thinking"
      ],
      correctAnswer: 1
    },
    {
      question: "Why is it important to learn about this topic?",
      options: [
        "It helps us understand how our world works",
        "It's not important for everyday life",
        "Only scientists need to know about it",
        "To pass tests in school"
      ],
      correctAnswer: 0
    }
  ];
} 