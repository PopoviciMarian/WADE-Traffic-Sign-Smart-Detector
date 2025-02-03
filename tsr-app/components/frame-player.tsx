"use client"

import { useRef, useEffect , useState} from "react"
import { Card } from "@/components/ui/card"
import type { Frame } from "@/models/Frame"
import { FrameDescription } from "@/components/frame-description"
import type { OntologyData } from "@/models/Ontology"

interface FramePlayerProps {
  frame: Frame
}

export function FramePlayer({ frame }: FramePlayerProps) {
  const [ontologyData, setOntologyData] = useState<OntologyData[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
                    // drow the index of the detection in the top left corner
          ctx.fillStyle = "#00f"
          //bold the text
          ctx.font = "bold 40px Arial"
          ctx.fillText(detection.classId.toString(), detection.point.x1, detection.point.y1)

        })
      }


        const ontologyPromises = frame.detections.map((detection) =>
          fetch(
            `https://ontology-service-1003028948668.us-central1.run.app/ontology?id=${detection.classId}&lang=en`,
          ).then((res) => res.json()),
        )

        const ontologyResults = await Promise.all(ontologyPromises)
        setOntologyData(ontologyResults)
        setIsLoading(false)

    }



    drawFrame()
  }, [frame])

  return (
    <div className="space-y-4">
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </Card>
    <FrameDescription isLoading={isLoading} ontologyData={ontologyData} />
  </div>
  )
}