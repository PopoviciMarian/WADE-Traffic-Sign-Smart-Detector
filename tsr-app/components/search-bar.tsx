import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTranslation } from "@/lib/use-translation"
import { Logo } from "@/components/logo"

// This would typically come from your authentication system
const currentUser = {
  name: "John Doe",
  email: "john@example.com",
  imageUrl: "/placeholder.svg?height=32&width=32",
}

export function SearchBar() {
  const { t } = useTranslation()
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Logo />
        <div className="ml-auto flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder={("search.placeholder")} className="pl-8 w-[200px] lg:w-[300px]" />
          </div>
          <ThemeToggle />
          <UserNav user={currentUser} />
        </div>
      </div>
    </div>
  )
}

