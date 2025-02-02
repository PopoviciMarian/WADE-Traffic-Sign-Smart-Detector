"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Video {
  id: number
  videoId: string
  title: string
  thumbnail: string
  progress: number
  isPublic: boolean
  user: {
    name: string
    avatar: string
  }
}

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  video: Video | null
}

export function ShareDialog({ open, onOpenChange, video }: ShareDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isPublic, setIsPublic] = useState(video?.isPublic || false)

  useEffect(() => {
    setIsPublic(video?.isPublic || false)
  }, [video])

  

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() === "") return

    try {
      const response = await fetch(`/api/users?query=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error("Failed to search users")
      const users = await response.json()
      setSearchResults(users)
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const handleTogglePublic = async () => {
    if (!video) return

    try {
      const response = await fetch(`/api/videos/${video.videoId}/toggle-privacy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      })

      if (!response.ok) throw new Error("Failed to update video privacy")
      setIsPublic(!isPublic)
    } catch (error) {
      console.error("Error updating video privacy:", error)
    }
  }

  const handleShareWithUser = async (userId: string) => {
    if (!video) return

    try {
      const response = await fetch(`/api/videos/${video.videoId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) throw new Error("Failed to share video")
      
        onOpenChange(false)
    } catch (error) {
      console.error("Error sharing video:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Video: {video?.videoId}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Switch id="public-toggle" checked={isPublic} onCheckedChange={handleTogglePublic} />
          <Label htmlFor="public-toggle">Make video public</Label>
        </div>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        <div className="mt-4 space-y-2">
          {searchResults.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleShareWithUser(user.email)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

