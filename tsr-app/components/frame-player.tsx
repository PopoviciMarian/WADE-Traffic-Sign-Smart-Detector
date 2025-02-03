"use client"

import { useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import type { Frame } from "@/models/Frame"

interface FramePlayerProps {
  frame: Frame
}

export function FramePlayer({ frame }: FramePlayerProps) {
    console.log("FramePlayer", frame)
    console.log("FramePlayer", frame.url)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const drawFrame = async () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx) return

      const img = new Image()
      img.src = frame.url + "?authuser=3"
      img.crossOrigin = "anonymous"

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // Draw detections
        frame.detections.forEach((detection) => {
          // light blue
          ctx.strokeStyle = "#00f"
          ctx.lineWidth = 10
          ctx.strokeRect(
            detection.point.x1,
            detection.point.y1,
            detection.point.x2 - detection.point.x1,
            detection.point.y2 - detection.point.y1,
          )
        })
      }
    }

    drawFrame()
  }, [frame])

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </Card>
  )
}

