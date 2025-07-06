# Supabase Setup Instructions

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://yuibscoycdrfnznoxcng.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aWJzY295Y2RyZm56bm94Y25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTAxMTAsImV4cCI6MjA2NzM4NjExMH0.g1X7PyzwWJdBxgaJEOjqB26Z-TdMsajndrzAD0x_BnM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aWJzY295Y2RyZm56bm94Y25nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgxMDExMCwiZXhwIjoyMDY3Mzg2MTEwfQ.nW00IULTodYxx8OaUBKN2KxDRTtzR2YOppAiRu8paVQ
```

## 2. Database Setup

Go to your Supabase dashboard and run the SQL from `supabase-schema.sql` in the SQL editor. This will create:

- `users` table for user profiles
- `chats` table for storing chat history
- `user_settings` table for user preferences
- Row Level Security policies
- Triggers for automatic timestamps
- Indexes for performance

## 3. Authentication Setup

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Make sure "Enable email confirmations" is set to your preference
3. Configure any additional auth providers if needed
4. Set up email templates if desired

## 4. Features Now Available

With this setup, users can:

- **Sign up/Sign in** with email and password
- **Auto-profile creation** when signing up
- **Chat history** - all chats are saved per user
- **User settings** - theme, complexity level, default length, notifications
- **Secure data** - Row Level Security ensures users only see their own data

## 5. Integration Status

✅ **Auth Context** - Global authentication state management
✅ **Database Types** - TypeScript types for all tables
✅ **Chat Hook** - `useSupabaseChats()` for managing chats
✅ **Settings Hook** - `useUserSettings()` for managing preferences
✅ **Auth Components** - Updated AuthPopup and Header components
✅ **Security** - Row Level Security policies implemented

## 6. Next Steps

The following components are now ready to be connected to Supabase:

1. **Settings Popup** - Connect to `useUserSettings()` hook
2. **Feedback System** - Can be extended to save feedback to database
3. **Upgrade Plans** - User plan information stored in user profile
4. **Chat Sidebar** - Connect to `useSupabaseChats()` hook

## Usage Examples

### Using the Chat Hook
```tsx
import { useSupabaseChats } from '@/hooks/use-supabase-chats'

function ChatComponent() {
  const { chats, createChat, updateChat, deleteChat } = useSupabaseChats()
  
  // Create a new chat
  const newChat = await createChat('Chat Title', messages)
  
  // Update existing chat
  await updateChat(chatId, { title: 'New Title' })
  
  // Delete chat
  await deleteChat(chatId)
}
```

### Using the Settings Hook
```tsx
import { useUserSettings } from '@/hooks/use-user-settings'

function SettingsComponent() {
  const { settings, updateTheme, updateComplexityLevel } = useUserSettings()
  
  // Update theme
  await updateTheme('dark')
  
  // Update complexity level
  await updateComplexityLevel(4)
}
```

### Using Auth
```tsx
import { useAuth } from '@/lib/auth-context'

function Component() {
  const { user, signIn, signOut } = useAuth()
  
  if (user) {
    return <div>Welcome {user.email}</div>
  }
  
  return <SignInButton />
}
``` 