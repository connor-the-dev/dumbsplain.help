// Client-side functions to interact with the API routes

interface Message {
  isUser: boolean;
  content: string;
}

export async function generateExplanation(
  question: string, 
  length: string, 
  conversationHistory?: Message[],
  complexity?: number,
  abortController?: AbortController
): Promise<string> {
  try {
    const response = await fetch('/api/generate-explanation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question, 
        length,
        complexity: complexity !== undefined ? complexity : 0, // Default to 0 if not provided
        conversation: conversationHistory 
      }),
      signal: abortController?.signal
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate explanation');
    }

    const data = await response.json();
    return data.explanation || "I couldn't generate an explanation.";
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request was cancelled');
    }
    console.error('Error generating explanation:', error);
    return "Sorry, I ran into a problem generating your explanation. Please try again later!";
  }
}

export async function generateQuiz(topic: string, explanation: string, abortController?: AbortController): Promise<any> {
  try {
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, explanation }),
      signal: abortController?.signal
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate quiz');
    }

    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request was cancelled');
    }
    console.error('Error generating quiz:', error);
    return [];
  }
} 