"use server"

import { revalidatePath } from "next/cache"
import { Frame, Detection } from "@/models/Frame"
import clientPromise from "@/lib/mongodb"

const getFrames = async (videoId: string, fps: number) => {
  const URL = process.env.NEXT_PUBLIC_FRAME_EXTRACTOR_SERVICE_URL ?? ""
  
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ unique_filename: videoId, frame_rate: fps }),
  })

  if (!response.ok) {
    throw new Error("Failed to extract frames")
  }

  return (await response.json())["frames"] as string[]

}

const signDetection = async (frameUrl: string) => {
  
  const frameId = frameUrl.split("/").pop()
  const URL = process.env.NEXT_PUBLIC_VIDEO_SIGN_DETECTION_SERVICE_URL ?? ""
  console.log("Frame ID", frameId)
  console.log("URL", URL)
  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ frame_id: frameId }),
  })

  if (!response.ok) {
    throw new Error("Failed to detect signs")
  }
  return (await response.json())["detections"] as any[]
}


export async function processVideo(videoId: string, fps: number) {
  try {
   console.log("Processing video", videoId)
    const frames = await getFrames(videoId, fps)
    const detections = await Promise.all(frames.map((frame: string) => signDetection(frame)))
    const frameData = frames.map((frame, index) => {
      return {
        url: frame,
        detections: detections[index].map((detection: any) => {
          return {
            classId: detection.classId,
            point: detection.point,
          } as Detection
        }),
      } as Frame
    })

    const client = await clientPromise
    const db = client.db()
    await db.collection("frames").insertMany(frameData)
    await db.collection("videos").updateOne({ videoId }, { $set: { isProcessed: true } })


    console.log("Video processed successfully")
    return { success: true, videoId: "generated-id" }
  } catch (error) {
    console.error("Error processing video:", error)
    return { success: false, error: "Failed to process video" }
  }
}

