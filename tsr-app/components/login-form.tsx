"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"
import { useTranslation } from "@/lib/use-translation"
import { Logo } from "@/components/logo"

export function LoginForm() {
  const { t } = useTranslation()

  const handleGitHubLogin = () => {
    signIn("github", { callbackUrl: "/" })
  }

  return (
    <Card className="w-[350px] max-h-[90vh] overflow-y-auto">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl text-center">{t("login.title")}</CardTitle>
        <CardDescription className="text-center">{t("login.description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button className="w-full" onClick={handleGitHubLogin}>
          <Github className="mr-2 h-4 w-4" />
          {t("login.githubButton")}
        </Button>
      </CardContent>
    </Card>
  )
}