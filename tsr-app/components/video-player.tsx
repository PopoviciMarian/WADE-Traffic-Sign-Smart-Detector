"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

interface VideoPlayerProps {
  videoId: string
  videoUrl: string
}

export function VideoPlayer({ videoId, videoUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener("timeupdate", updateTime)
    video.addEventListener("loadedmetadata", updateDuration)

    return () => {
      video.removeEventListener("timeupdate", updateTime)
      video.removeEventListener("loadedmetadata", updateDuration)
    }
  }, [])

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

  const handleTimeChange = (newTime: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime[0]
      setCurrentTime(newTime[0])
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume[0]
      setVolume(newVolume[0])
      setIsMuted(newVolume[0] === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
      if (isMuted) {
        videoRef.current.volume = volume
      } else {
        setVolume(videoRef.current.volume)
        videoRef.current.volume = 0
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <video ref={videoRef} className="w-full h-full" src={videoUrl} onClick={togglePlay}>
          Your browser does not support the video tag.
        </video>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:text-white/80">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <div className="flex-1 mx-4">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={handleTimeChange}
                className="w-full"
              />
            </div>
            <span className="text-sm mr-4">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:text-white/80">
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
