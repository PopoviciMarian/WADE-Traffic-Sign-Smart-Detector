"use client"

import { VideoGrid } from "@/components/video-grid"
import { UploadArea } from "@/components/upload-area"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import type { Video } from "@/models/Video"

export default function Dashboard() {
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
      fetch("/api/videos?mode=my")
        .then((res) => res.json())
        .then((data) => {
          setVideos(data)
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching user videos:", error)
          setLoading(false)
        })
    }
  }, [status])

  const reloadVideos = () => {
    fetch("/api/videos?mode=my")
      .then((res) => res.json())
      .then((data) => {
        setVideos(data)
      })
      .catch((error) => {
        console.error("Error fetching user videos:", error)
      })
  }

  if (status === "loading" || loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <UploadArea onClose={reloadVideos} />
      <h1 className="text-2xl font-bold">My Videos</h1>
      <VideoGrid videos={videos} isMyVideos={true} />
    </div>
  )
}

