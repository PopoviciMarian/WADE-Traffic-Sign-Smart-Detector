"use server"

import { revalidatePath } from "next/cache"


const getFrames = async (videoId: string, fps: number) => {
  const URL = process.env.NEXT_PUBLIC_FRAME_EXTRACTOR_SERVICE_URL ?? ""
/*
{
  "unique_filename": "6dbcaf5e27cd45f1b42631951684b5bb.mp4",
  "frame_rate": 2
}*/

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

  return response.json()

}

export async function processVideo(videoId: string, fps: number) {
  try {
   

    // Here you would:
    // 1. Upload the video to storage
    // 2. Start a background job to process frames
    // 3. Store frame metadata in your database

    // Example structure for frame processing:
    const frames = {
      videoId: "generated-id",
      totalFrames: 0,
      frames: [
        {
          frameNumber: 1,
          timestamp: 0,
          description: "",
          metadata: {},
        },
      ],
    }

    revalidatePath("/videos")
    return { success: true, videoId: "generated-id" }
  } catch (error) {
    return { success: false, error: "Failed to process video" }
  }
}

