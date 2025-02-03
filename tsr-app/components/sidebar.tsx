"use client"
import { Button } from "@/components/ui/button"
import { FolderHeart, Users, Globe, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTranslation } from "@/lib/use-translation"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSession } from "next-auth/react"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { data: session } = useSession()
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  const routes = [
    ...(session
      ? [
          {
            label: t("nav.myVideos"),
            icon: FolderHeart,
            href: "/",
            variant: "ghost",
          },
          {
            label: t("nav.shared"),
            icon: Users,
            href: "/shared",
            variant: "ghost",
          },
        ]
      : []),
    {
      label: t("nav.public"),
      icon: Globe,
      href: "/public",
      variant: "ghost",
    },
  ]

  const SidebarContent = (
    <div className="flex flex-col h-full bg-background/95 backdrop-blur-sm">
      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              className="w-full justify-start text-accent hover:text-accent-foreground hover:bg-accent/10 dark:text-primary-a30 dark:hover:text-primary-a10 dark:hover:bg-surface-a20"
              asChild
              onClick={() => setIsOpen(false)}
            >
              <Link href={route.href}>
                <route.icon className="mr-2 h-4 w-4" />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <p className="text-sm text-muted-foreground">© 2025 Traffic Sign Recognition</p>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-56">
          {SidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="hidden md:flex md:flex-col md:h-screen md:w-56 md:bg-background/95 md:backdrop-blur-sm md:border-r md:border-border md:fixed md:left-0 md:top-0 md:z-40 md:pt-16 md:overflow-y-auto">
      {SidebarContent}
    </div>
  )
}

