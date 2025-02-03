"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface FrameDescriptionProps {
  description: string
  user: {
    name: string
    avatar: string
  }
}

export function FrameDescription({ description, user }: FrameDescriptionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Description</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.name}</span>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-semibold">Metadata</h4>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Uploaded:</dt>
            <dd>2 days ago</dd>
            <dt className="text-muted-foreground">Duration:</dt>
            <dd>5m 30s</dd>
            <dt className="text-muted-foreground">Views:</dt>
            <dd>1,234</dd>
          </dl>
        </div>
      </CardContent>
    </Card>
  )
}

