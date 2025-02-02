"use client";
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { LanguageSelector } from "@/components/language-selector"
import { LoginButton } from "@/components/login-button"
import { useSession } from "next-auth/react"

interface UserNavProps {
 
    name: string
    email: string
    image: string
  
}



export function AppBar() {
  const { data: session } = useSession()
  if (session) {
    console.log(session.user)
  }

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4">
        <Logo />
        <div className="ml-auto flex items-center space-x-4">
          <LanguageSelector />
          <ThemeToggle />
          {session ?   <UserNav user={session.user as UserNavProps}  /> : <LoginButton />}
        </div>
      </div>
    </div>
  )
}

