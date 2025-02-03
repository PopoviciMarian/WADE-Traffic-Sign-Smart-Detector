"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface FrameControlsProps {
  totalFrames: number
  currentFrame: number
  onFrameChange: (frameIndex: number) => void
}

export function FrameControls({ totalFrames, currentFrame, onFrameChange }: FrameControlsProps) {
  const handlePrevFrame = () => {
    onFrameChange(Math.max(0, currentFrame - 1))
  }

  const handleNextFrame = () => {
    onFrameChange(Math.min(totalFrames - 1, currentFrame + 1))
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
          onValueChange={(value) => onFrameChange(value[0])}
          className="mt-6"
        />
      </CardContent>
    </Card>
  )
}

