import type { ObjectId } from "mongodb"


export interface Detection {
    _id?: ObjectId
    classId: number
    point: {
        x1: number
        x2: number
        y1: number
        y2: number
    }
}

export interface Frame {
    _id?: ObjectId
    videoId: string
    index: number
    url: string
    detections: Detection[]
}

export const DetectionSchema = {
    classId: { type: Number, required: true },
    point: {
        x1: { type: Number, required: true },
        x2: { type: Number, required: true },
        y1: { type: Number, required: true },
        y2: { type: Number, required: true },
    },
}

export const FrameSchema = {
    videoId: { type: String, required: true },
    index: { type: Number, required: true },
    url: { type: String, required: true },
    detections: { type: [DetectionSchema], required: true },
}

