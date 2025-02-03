import type { ObjectId } from "mongodb"


export interface Video {
  _id?: ObjectId
  userId: string
  videoId: string
  videoUrl: string
  uploadedAt: Date
  isPublic: boolean
  isProcessed: boolean
  sharedWith: string[]
  thumbnailUrl: string,
  fps: number
  length: number
  frames: number
  processingTime?: number
  splitInFramesTime?: number
  detectionsTime?: number
  averageFrameDetectionTime?: number
}

export const VideoSchema = {
  userId: { type: String, required: true },
  videoId: { type: String, required: true, unique: true },
  videoUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  isPublic: { type: Boolean, default: false },
  isProcessed: { type: Boolean, default: false },
  sharedWith: { type: [String], default: [] },
  thumbnailUrl: { type: String, default: "" },
}

