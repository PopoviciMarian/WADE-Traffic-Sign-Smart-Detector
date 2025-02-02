import type { ObjectId } from "mongodb"

export interface Frame {
    _id?: ObjectId
    videoId: string
    index: number
    url: string
}

export const FrameSchema = {
    videoId: { type: String, required: true },
    index: { type: Number, required: true },
    url: { type: String, required: true },
}