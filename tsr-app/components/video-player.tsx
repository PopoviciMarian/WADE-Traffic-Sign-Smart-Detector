"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

interface VideoPlayerProps {
  videoId: string
  videoUrl: string
}

export function VideoPlayer({ videoId, videoUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <video ref={videoRef} className="w-full h-full" src={videoUrl}>
          Your browser does not support the video tag.
        </video>
        <Button
          variant="ghost"
          size="icon"
          className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-background/80 hover:bg-background/90"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
      </div>
    </Card>
  )
}

