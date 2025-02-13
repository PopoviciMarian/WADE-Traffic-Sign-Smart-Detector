"use client"

import { VideoGrid } from "@/components/video-grid"
import { UploadArea } from "@/components/upload-area"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import type { Video } from "@/models/Video"
import { SkeletonVideoGrid } from "@/components/skeleton-video-grid"

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
      const fetchVideos = () => {
        fetch("/api/videos?mode=my")
          .then((res) => res.json())
          .then((data) => {
            setVideos(data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching user videos:", error);
            setLoading(false);
          });
      };
  
      fetchVideos(); // Initial fetch
  
      // Poll every 10 seconds
      const interval = setInterval(fetchVideos, 10000);
  
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [status]);

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
    return (
      <div className="p-6 space-y-6">
      <UploadArea onClose={reloadVideos} />
      <h1 className="text-2xl font-bold">My Videos</h1>
      <SkeletonVideoGrid />
    </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <UploadArea onClose={reloadVideos} />
      <h1 className="text-2xl font-bold">My Videos</h1>
      <VideoGrid videos={videos} isMyVideos={true} />
    </div>
  )
}

