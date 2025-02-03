"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { VideoGrid } from "@/components/video-grid"
import { useState, useEffect } from "react"
import type { Video } from "@/models/Video"
import { SkeletonVideoGrid } from "@/components/skeleton-video-grid"

export default function SharedPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/public")
    },
  })

  const [videos, setVideos] = useState<[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/videos?mode=shared")
        .then((res) => res.json())
        .then((data) => {
          setVideos(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching shared videos:", error)
          setLoading(false)
        })
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Shared Videos</h1>
      <SkeletonVideoGrid />
    </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Shared Videos</h1>
      <VideoGrid videos={videos} isMyVideos={false} />
    </div>
  )
}

