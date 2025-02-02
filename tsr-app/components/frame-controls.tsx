"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export function FrameControls() {
  const [currentFrame, setCurrentFrame] = useState(0)
  const totalFrames = 100 // This would come from your video metadata

  const handlePrevFrame = () => {
    setCurrentFrame((prev) => Math.max(0, prev - 1))
  }

  const handleNextFrame = () => {
    setCurrentFrame((prev) => Math.min(totalFrames - 1, prev + 1))
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Frame Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="icon" onClick={handlePrevFrame} disabled={currentFrame === 0}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Frame {currentFrame + 1} of {totalFrames}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextFrame} disabled={currentFrame === totalFrames - 1}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <Slider
          value={[currentFrame]}
          max={totalFrames - 1}
          step={1}
          onValueChange={(value) => setCurrentFrame(value[0])}
          className="mt-6"
        />
      </CardContent>
    </Card>
  )
}

