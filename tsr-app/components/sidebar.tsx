"use client"
import { Button } from "@/components/ui/button"
import { FolderHeart, Users, Globe } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useTranslation } from "@/lib/use-translation"
import { useSession } from "next-auth/react"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { data: session } = useSession()

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

  return (
    <div className="flex flex-col h-screen w-56 bg-surface-a0 dark:bg-surface-a0 border-r border-border fixed left-0 top-0 z-40 pt-16 overflow-y-auto">
      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              className="w-full justify-start text-accent hover:text-accent-foreground hover:bg-accent/10 dark:text-primary-a30 dark:hover:text-primary-a10 dark:hover:bg-surface-a20"
              asChild
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
}

