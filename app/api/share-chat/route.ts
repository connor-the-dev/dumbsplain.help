import { NextRequest, NextResponse } from 'next/server'
import { createClientSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json()
    
    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    const supabase = createClientSupabase()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if the chat exists and belongs to the user
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single()

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Generate shareable URL
    const shareUrl = `${request.nextUrl.origin}/share/${chatId}`
    
    return NextResponse.json({ 
      shareUrl,
      chatId,
      title: chat.title 
    })
  } catch (error) {
    console.error('Error sharing chat:', error)
    return NextResponse.json({ error: 'Failed to share chat' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')
    
    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 })
    }

    const supabase = createClientSupabase()
    
    // Get the chat data for sharing (no auth required for viewing shared chats)
    const { data: chat, error } = await supabase
      .from('chats')
      .select('id, title, messages, created_at, updated_at')
      .eq('id', chatId)
      .single()

    if (error || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      chat: {
        id: chat.id,
        title: chat.title,
        messages: chat.messages,
        created_at: chat.created_at,
        updated_at: chat.updated_at
      }
    })
  } catch (error) {
    console.error('Error fetching shared chat:', error)
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 })
  }
} 