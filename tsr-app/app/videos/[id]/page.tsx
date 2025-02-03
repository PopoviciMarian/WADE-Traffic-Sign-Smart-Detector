"use client";

import { VideoPlayer } from "@/components/video-player"
import { FrameControls } from "@/components/frame-controls"
import { VideoTabs } from "@/components/video-tabs"
import { FrameDescription } from "@/components/frame-description"
import { notFound } from "next/navigation"
import { Video } from "@/models/Video"
import { Frame } from "@/models/Frame"
import { useState, useEffect } from "react"
import { FramePlayer } from "@/components/frame-player";
import { SkeletonVideoPage } from "@/components/skeleton-video-page";
interface VideoPageProps {
  params: {
    id: string
  }
}

const  fetchVideoInfo = async (id: string): Promise<Video> => {
  console.log("Fetching video info", id)
  const response = await fetch(`/api/videos/${id}/info`)
  if (!response.ok) {
    throw new Error("Failed to fetch video")
  }
  return response.json()
}

const fetchFrame = async (videoId: string, frameIndex: number): Promise<Frame> => {
  const response = await fetch(`/api/videos/${videoId}/frames/${frameIndex}`)
  if (!response.ok) {
    throw new Error("Failed to fetch frame")
  }
  return response.json()
}


export default function VideoPage({ params }: VideoPageProps) {
  const { id } = params
  const [video, setVideo] = useState<Video | null>(null)
  const [currentFrame, setCurrentFrame] = useState<Frame | null>(null)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"frames" | "video">("frames")
  
  useEffect(() => {
    const loadVideoInfo = async () => {
      const videoInfo = await fetchVideoInfo(id as string)
      setVideo(videoInfo)
      const initialFrame = await fetchFrame(id as string, 0)
      setCurrentFrame(initialFrame)
    }
    loadVideoInfo()
  }, [id])


  const handleFrameChange = async (newIndex: number) => {
    const frame = await fetchFrame(id as string, newIndex)
    setCurrentFrame(frame)
    setCurrentFrameIndex(newIndex)
  }
  
  if (!video || !currentFrame) {
    return <SkeletonVideoPage />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
        <VideoTabs activeTab={viewMode} onTabChange={setViewMode} />
        {viewMode === "frames" ? (
            <FramePlayer frame={currentFrame} />
          ) : (
            <VideoPlayer videoId={params.id} videoUrl={video.videoUrl} />
          )}
          {/* <FrameDescription description={video.description} user={video.user} /> */}
        </div>

        <div className="lg:col-span-1">
          <FrameControls
            totalFrames={video.frames}
            currentFrame={currentFrameIndex}
            onFrameChange={handleFrameChange}
          />
        </div>
        {/* <div className="lg:col-span-1">
          <FrameControls />
        </div> */}
      </div>
    </div>
  )
}

