"use client"

import { createContext, useContext, type ReactNode } from "react"

interface User {
  name: string
  email: string
  imageUrl?: string
}

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  // In a real app, you'd handle authentication state here
  const user = {
    name: "John Doe",
    email: "john@example.com",
    imageUrl: "/placeholder.svg?height=32&width=32",
  }

  const login = (user: User) => {
    // Implement login logic
  }

  const logout = () => {
    // Implement logout logic
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

