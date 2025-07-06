"use client"

import { useState, useEffect } from 'react'

export function useStickyState<T>(defaultValue: T, key: string): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    // Only access localStorage on client side
    if (typeof window === 'undefined') {
      return defaultValue
    }

    try {
      const stickyValue = window.localStorage.getItem(key)
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
    } catch (error) {
      console.error(`Error loading from localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  const setStickyValue = (newValue: T) => {
    try {
      setValue(newValue)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue))
      }
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error)
      // Still update state even if localStorage fails
      setValue(newValue)
    }
  }

  // Sync to localStorage whenever value changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error syncing to localStorage key "${key}":`, error)
    }
  }, [key, value])

  return [value, setStickyValue]
} 