import { VideoPlayer } from "@/components/video-player"
import { FrameControls } from "@/components/frame-controls"
import { VideoTabs } from "@/components/video-tabs"
import { FrameDescription } from "@/components/frame-description"
import { notFound } from "next/navigation"

// This would typically come from your database or API
const videos = [
  {
    id: 1,
    title: "Stop Sign Detection Algorithm",
    description: "A detailed explanation of our stop sign detection algorithm using computer vision techniques.",
    url: "/placeholder.mp4",
    thumbnail: "/placeholder.svg",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  {
    id: 2,
    title: "Speed Limit Sign Recognition",
    description: "Demonstrating our latest speed limit sign recognition model with real-world examples.",
    url: "/placeholder.mp4",
    thumbnail: "/placeholder.svg",
    user: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  },
  // Add more video objects as needed
]

interface VideoPageProps {
  params: {
    id: string
  }
}

export default function VideoPage({ params }: VideoPageProps) {
  const video = videos.find((v) => v.id === Number.parseInt(params.id))

  if (!video) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{video.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <VideoTabs />
          <VideoPlayer videoId={params.id} videoUrl={video.url} />
          <FrameDescription description={video.description} user={video.user} />
        </div>
        <div className="lg:col-span-1">
          <FrameControls />
        </div>
      </div>
    </div>
  )
}

