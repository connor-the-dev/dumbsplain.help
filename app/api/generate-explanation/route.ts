import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { ChatCompletionMessageParam } from 'openai/resources';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { question, length, complexity = 0, conversation } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const maxTokens = 
      length === "short" ? 250 :
      length === "medium" ? 500 : 
      800; // long
    
    // Get language complexity level based on slider value
    const getComplexityLevel = (value: number) => {
      if (value < 20) return "like I'm 5 years old";
      if (value < 40) return "at an elementary school level";
      if (value < 60) return "at a middle school level";
      if (value < 80) return "at a high school level";
      return "at an expert level, assuming I have background knowledge in this area";
    };
    
    const complexityLevel = getComplexityLevel(complexity);
    
    // Initialize the messages array with the system message
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an expert at explaining complex topics in an accessible way.
        Adjust your explanation for a ${complexityLevel} understanding.
        ${complexity < 40 ? 'Use simple language, metaphors, and relatable examples.' : ''}
        ${complexity >= 40 && complexity < 80 ? 'Use moderately complex language with some technical terms but explain them when first introduced.' : ''}
        ${complexity >= 80 ? 'Use technical language and advanced concepts, assuming background knowledge in the field.' : ''}
        Be friendly, engaging, and make the explanation interesting.
        Make your explanation ${length} (${maxTokens} tokens maximum).

        IMPORTANT: For key concepts and important words, wrap them in color tags using these colors:
        - <blue>word</blue> for blue-400
        - <red>word</red> for red-400
        - <yellow>word</yellow> for yellow-400

        Rules for coloring:
        1. Use the same color for the same word throughout the explanation
        2. Choose colors randomly but consistently
        3. Only color important concepts and key terms
        4. Don't overuse colors - aim for 3-5 colored words per explanation
        5. Keep the colors balanced (don't use one color too much)`
      }
    ];
    
    // If we have conversation history, add it to provide context
    if (conversation && Array.isArray(conversation) && conversation.length > 0) {
      // Add previous messages as context
      conversation.forEach(msg => {
        messages.push({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content
        } as ChatCompletionMessageParam);
      });
    }
    
    // Add the current question
    messages.push({
      role: "user",
      content: `${!conversation || conversation.length === 0 ? `Explain this ${complexityLevel}: ` : ''}${question}`
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    });

    return NextResponse.json({ explanation: response.choices[0].message.content });
  } catch (error) {
    console.error('Error generating explanation:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
} 