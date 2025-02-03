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
    console.error("Failed to detect signs")
    throw new Error("Failed to detect signs")
  }
  const responseJson = await response.json()

  const r = {
    detections: responseJson["detections"],
    frameId,
  }
  return r;
}


export async function processVideo(videoId: string, fps: number) {
  try {
    const start = Date.now()
    
    console.log(`[${videoId}] - Processing video with ${fps} FPS started at ${start.toString()}`)
    const frames = await getFrames(videoId, fps)
    const splitInFramesTime = Date.now() - start;
    console.log(`[${videoId}] - Extracted ${frames.length} frames in ${splitInFramesTime}ms`)
    const detections = await Promise.all(frames.map((frame: string) => signDetection(frame)))
    const detectionsTime = Date.now() - start - splitInFramesTime;
    console.log(`[${videoId}] - Detected signs in ${frames.length} frames in ${detectionsTime}ms`)

    // const frameData = frames.map((frame, index) => {
    //   return {
    //     url: frame,
    //     videoId,
    //     index,
    //     detections: detections[index].map((detection: any) => {
    //       return {
    //         classId: detection.classId,
    //         point: detection.point,
    //       } as Detection
    //     }),
    //   } as Frame
    // })
    const frameData = frames.map((frame, index) => {
      return {
        url: frame,
        videoId,
        index,
        detections: detections.find((detection) => detection.frameId === frame.split("/").pop())?.detections.map((detection: any) => {
          return {
            classId: detection.classId,
            point: detection.point,
          } as Detection
        }) ?? [],
      } as Frame
    })
    const client = await clientPromise
    const db = client.db()
    await db.collection("frames").insertMany(frameData)
    await db.collection("videos").updateOne({ videoId }, { $set: { isProcessed: true , processingTime: Date.now() - start , splitInFramesTime, detectionsTime } })

    console.log(`[${videoId}] - Processed video in ${Date.now() - start}ms`)
    return { success: true, videoId: "generated-id" }
  } catch (error) {
    // TODO: Add a better error handling
    const client = await clientPromise
    const db = client.db()
    await db.collection("videos").deleteOne({ videoId })
    console.error("Error processing video:", error)
    return { success: false, error: "Failed to process video" }
  }
}

