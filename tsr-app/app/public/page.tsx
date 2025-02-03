"use client"

import { VideoGrid } from "@/components/video-grid"
import { useState, useEffect } from "react"
import type { Video } from "@/models/Video"
import { SkeletonVideoGrid } from "@/components/skeleton-video-grid"

export default function PublicPage() {
  const [videos, setVideos] = useState<[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/videos?mode=public")
      .then((res) => res.json())
      .then((data) => {
        setVideos(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching public videos:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Public Videos</h1>
      <SkeletonVideoGrid />
    </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Public Videos</h1>
      <VideoGrid videos={videos} isMyVideos={false} />
    </div>
  )
}