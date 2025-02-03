"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, Loader2, Clock, Film, Eye, Zap, Upload } from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ShareDialog } from "@/components/share-dialog"
import { useTranslation } from "@/lib/use-translation"

interface Video {
  id: number
  videoId: string
  title: string
  thumbnail: string
  progress: number
  isPublic: boolean
  isProcessed: boolean
  processingTime?: number
  splitInFramesTime?: number
  detectionsTime?: number
  fps?: number
  averageFrameDetectionTime?: number
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
  const { t } = useTranslation()

  const handleShareClick = (e: React.MouseEvent, video: Video) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedVideo(video)
    setShareDialogOpen(true)
  }
  const formatTime = (time: number | undefined) => {
    if (time === undefined || time == null) return "N/A"
    // convert ms to s
    time = time / 1000
    return `${time.toFixed(2)}s`
  }

  if (videos.length === 0) {
    let emptyStateMessage = ""
    if (isMyVideos) {
      emptyStateMessage = t("videoGrid.emptyState.myVideos")
    } else if (window.location.pathname === "/shared") {
      emptyStateMessage = t("videoGrid.emptyState.shared")
    } else {
      emptyStateMessage = t("videoGrid.emptyState.public")
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Upload className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-xl font-semibold mb-2">{emptyStateMessage}</p>
        {isMyVideos && (
          <Button asChild>
            <Link href="/">{t("upload.title")}</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.id}>
            {video.isProcessed ? (
              <Link href={`/videos/${video.videoId}`}>
                <Card className="cursor-pointer transition-all duration-300 bg-surface-a10 dark:bg-surface-a10 relative hover:shadow-md hover:border-primary hover:border-2">
                  <CardContent className="p-4">

                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
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
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Processing Time: {formatTime(video.processingTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <Film className="w-4 h-4 mr-2" />
                        <span>Split Frames Time: {formatTime(video.splitInFramesTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        <span>Detections Time: {formatTime(video.detectionsTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        <span>FPS: {video.fps || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Avg Frame Detection: {formatTime(video.averageFrameDetectionTime)}</span>
                      </div>
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
            ) : (
              <Card className="bg-surface-a10 dark:bg-surface-a10 relative">
                <CardContent className="p-4">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
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
                  <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Processing Time: {formatTime(video.processingTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <Film className="w-4 h-4 mr-2" />
                        <span>Split Frames Time: {formatTime(video.splitInFramesTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        <span>Detections Time: {formatTime(video.detectionsTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        <span>FPS: {video.fps || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Avg Frame Detection: {formatTime(video.averageFrameDetectionTime)}</span>
                      </div>
                    </div>
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
                    <p className="text-lg font-semibold text-foreground mb-2">Processing</p>
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} video={selectedVideo} />
    </>
  )
}