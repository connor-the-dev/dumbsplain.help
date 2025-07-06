import { useState, useEffect } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useAuth } from '@/lib/auth-context'

type UserSettings = Database['public']['Tables']['user_settings']['Row']
type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']

interface UserSettingsValues {
  theme: 'light' | 'dark' | 'system'
  complexity_level: number
  default_length: 'short' | 'medium' | 'long'
  notifications_enabled: boolean
}

const defaultSettings: UserSettingsValues = {
  theme: 'system',
  complexity_level: 3,
  default_length: 'medium',
  notifications_enabled: true
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettingsValues>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClientSupabase()

  useEffect(() => {
    if (user) {
      fetchSettings()
    } else {
      setSettings(defaultSettings)
      setLoading(false)
    }
  }, [user])

  const fetchSettings = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If no settings exist, create default ones
        if (error.code === 'PGRST116') {
          await createDefaultSettings()
        } else {
          console.error('Error fetching settings:', error)
        }
        return
      }

      setSettings({
        theme: data.theme,
        complexity_level: data.complexity_level,
        default_length: data.default_length,
        notifications_enabled: data.notifications_enabled
      })
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultSettings = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          ...defaultSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating default settings:', error)
        return
      }

      setSettings(defaultSettings)
    } catch (error) {
      console.error('Error creating default settings:', error)
    }
  }

  const updateSettings = async (updates: Partial<UserSettingsValues>) => {
    if (!user) return false

    try {
      const newSettings = { ...settings, ...updates }
      
      const { error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating settings:', error)
        return false
      }

      setSettings(newSettings)
      return true
    } catch (error) {
      console.error('Error updating settings:', error)
      return false
    }
  }

  const updateTheme = async (theme: 'light' | 'dark' | 'system') => {
    return await updateSettings({ theme })
  }

  const updateComplexityLevel = async (complexity_level: number) => {
    return await updateSettings({ complexity_level })
  }

  const updateDefaultLength = async (default_length: 'short' | 'medium' | 'long') => {
    return await updateSettings({ default_length })
  }

  const updateNotifications = async (notifications_enabled: boolean) => {
    return await updateSettings({ notifications_enabled })
  }

  return {
    settings,
    loading,
    updateSettings,
    updateTheme,
    updateComplexityLevel,
    updateDefaultLength,
    updateNotifications,
    refetch: fetchSettings
  }
} 