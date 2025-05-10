import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { ChatCompletionMessageParam } from 'openai/resources';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { question, length, conversation } = await request.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const maxTokens = 
      length === "short" ? 250 :
      length === "medium" ? 500 : 
      800; // long
    
    // Initialize the messages array with the system message
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an expert at explaining complex topics in simple terms that a 5-year-old would understand. 
        Use simple language, metaphors, and examples that children can relate to.
        Avoid technical jargon and complex concepts unless you explain them through simple analogies.
        Be friendly, engaging, and make the explanation interesting and fun.
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
      content: `${!conversation || conversation.length === 0 ? 'Explain this to me like I\'m 5 years old: ' : ''}${question}`
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