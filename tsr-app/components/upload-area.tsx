"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Play, Pause, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/use-translation"
import { useSession } from "next-auth/react"
import { processVideo } from "@/app/actions/process-video"

interface UploadAreaProps {
  onClose: () => void
}

export function UploadArea({ onClose }: UploadAreaProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [fps, setFps] = useState("1")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { t } = useTranslation()
  const { data: session } = useSession()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedVideo(file)
      setIsExpanded(true)
      // Create URL for video preview
      const videoElement = document.createElement("video")
      videoElement.src = URL.createObjectURL(file)
      videoElement.onloadedmetadata = () => {
        setVideoDuration(videoElement.duration)
      }
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi"],
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    multiple: false,
  })

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

  const handleUpload = async () => {
     if (!selectedVideo || !session || isUploading) return
     setIsUploading(true)
    const formData = new FormData()
    formData.append("file", selectedVideo)
    
    try {
    
      const uploadResponse = await fetch(process.env.NEXT_PUBLIC_VIDEO_INGESTION_SERVICE_URL ?? "", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload video")
      }

      const { unique_filename, file_url, thumbnail_url } = await uploadResponse.json()

      // Save video data to MongoDB
      const saveResponse = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId: unique_filename, videoUrl: file_url, thumbnailUrl: thumbnail_url , fps: Number(fps) }),
      })

      if (!saveResponse.ok) {
        throw new Error("Failed to save video data")
      }

      
      processVideo(unique_filename, Number(fps))
      resetUpload()
     


      // // Simulate upload progress
      // let progress = 0
      // const interval = setInterval(() => {
      //   progress += 10
      //   setUploadProgress(progress)
      //   if (progress >= 100) {
      //     clearInterval(interval)
      //     // Here you would typically handle the actual upload
      //   }
      // }, 500)
    } catch (error) {
      console.error("Error uploading video:", error)
    }
  }

  const estimatedFrames = Math.ceil(videoDuration * Number(fps))

  const resetUpload = () => {
    setSelectedVideo(null)
    setUploadProgress(0)
    setFps("1")
    setIsExpanded(false)
    setIsUploading(false)
    onClose()
  }

  if (!session) {
    return (
      <div className="text-center p-6">
        <p>Please sign in to upload videos.</p>
      </div>
    )
  }

  if (!isExpanded) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer",
          isDragging && "border-primary bg-accent",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center gap-2">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drag and drop your video here, or click to select a file</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t("upload.title")}</h2>
          <Button variant="ghost" size="icon" onClick={resetUpload}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={selectedVideo ? URL.createObjectURL(selectedVideo) : undefined}
            className="w-full h-full"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-background/80 hover:bg-background/90"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="filename">File name</Label>
            <Input id="filename" value={selectedVideo?.name} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fps">Frames per second to process</Label>
            <Select value={fps} onValueChange={setFps}>
              <SelectTrigger>
                <SelectValue placeholder="Select FPS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5 FPS (1 frame every 2 seconds)</SelectItem>
                <SelectItem value="1">1 FPS</SelectItem>
                <SelectItem value="2">2 FPS</SelectItem>
                <SelectItem value="5">5 FPS</SelectItem>
                <SelectItem value="10">10 FPS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Estimated frames to be processed</Label>
          <p className="text-sm text-muted-foreground">
            This video will generate approximately {estimatedFrames} frames at {fps} FPS.
            {estimatedFrames > 1000 && (
              <span className="text-yellow-600 dark:text-yellow-400 ml-2">
                Warning: High frame count may increase processing time.
              </span>
            )}
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={resetUpload}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Uploading...
              </>
            ) : (
              "Start Processing"
            )}
          </Button>
        </div>
      </div>
      {uploadProgress > 0 && (
        <div>
          <Progress value={uploadProgress} className="h-2" />
          <p className="mt-2 text-sm text-muted-foreground">Processing... {uploadProgress}%</p>
        </div>
      )}
    </Card>
  )
}

