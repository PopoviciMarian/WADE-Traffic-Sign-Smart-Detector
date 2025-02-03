"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useSession } from "next-auth/react"

interface User {
  name: string
  email: string
  image?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const user = session?.user
    ? {
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || undefined,
      }
    : null

  return <AuthContext.Provider value={{ user, loading: status === "loading" }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)