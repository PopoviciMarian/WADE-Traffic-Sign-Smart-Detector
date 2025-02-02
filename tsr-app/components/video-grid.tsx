"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ShareDialog } from "@/components/share-dialog"

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

interface VideoGridProps {
  videos: Video[]
  isMyVideos?: boolean
}

export function VideoGrid({ videos, isMyVideos = false }: VideoGridProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  const handleShareClick = (e: React.MouseEvent, video: Video) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedVideo(video)
    setShareDialogOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Link href={`/videos/${video.id}`} key={video.id}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow bg-surface-a10 dark:bg-surface-a10 relative">
              <CardContent className="p-4">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover" />
                  {video.progress < 100 && (
                    <div className="absolute bottom-2 right-2 bg-surface-a0 dark:bg-surface-a0 text-foreground px-2 py-1 rounded-full text-sm">
                      {video.progress}%
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <h3 className="font-medium text-foreground">{video.title}</h3>
                </div>
                <div className="flex items-center mt-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={video.user.avatar} alt={video.user.name} />
                    <AvatarFallback>{video.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{video.user.name}</span>
                </div>
                {isMyVideos && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-surface-a0 dark:bg-surface-a10 hover:bg-surface-a20 dark:hover:bg-surface-a20"
                    onClick={(e) => handleShareClick(e, video)}
                  >
                    <Share2 className="h-4 w-4 text-accent dark:text-primary-a30" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} video={selectedVideo} />
    </>
  )
}

