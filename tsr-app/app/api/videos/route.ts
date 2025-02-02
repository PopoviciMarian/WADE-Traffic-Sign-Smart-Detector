import clientPromise from "@/lib/mongodb"
import type { Video } from "../../../models/Video"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { use } from "react"

export async function POST(req: NextRequest)  {
  
  const session = await getServerSession(authOptions);

   if (!session) {
     return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
   }

  const { videoId, videoUrl, thumbnailUrl, fps } = await req.json();
 
  if (!videoId || !videoUrl) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db()
   
    const video: Video = {
      userId: session.user?.email as string,
      videoId,
      videoUrl,
      uploadedAt: new Date(),
      isPublic: false,
      isProcessed: false,
      sharedWith: [ session.user?.email as string ],
      fps: Number(fps),
      thumbnailUrl: thumbnailUrl
    }

    await db.collection("videos").insertOne(video)

    return  NextResponse.json({ message: "Video uploaded successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error uploading video:", error)
    return NextResponse.json({ message: "Failed to upload video" }, { status: 500 })
  }
}

export async function GET(req: NextRequest)  {
  
  const mode = req.nextUrl.searchParams.get('mode');
  if (mode === "public") {
    return getPublicVideos()
  }
  else if (mode === "shared") {
    return getSharedVideos(req)
  }
  else if (mode === "my") {
    return getMyVideos(req)
  }


  return NextResponse.json({ message: "Invalid mode" }, { status: 400 })
}

const getPublicVideos = async () => {
  try {
  const client = await clientPromise
  const db = client.db()

  const videos = await db.collection("videos").find({ isPublic: true }).toArray()


  const responseVideos = videos.map((video) => {
    return {
      id: video._id,
      title: video.title,
      thumbnail: video.thumbnailUrl,
      progress: 100,
      user: {},
      }
    }
  )

  for (let i = 0; i < responseVideos.length; i++) {
    const user = await db.collection("users").findOne({ email: videos[i].userId })
    responseVideos[i].user = {
      name: user?.name,
      avatar: user?.image,
    }
  }
    return NextResponse.json(responseVideos)
  } catch (error) {
    console.error("Error fetching public videos:", error)
    return NextResponse.json({ message: "Failed to fetch public videos" }, { status: 500 })
  }
}

const getSharedVideos = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // if sharedWith array contains the user's email address
    const videos = await db.collection("videos").find({ sharedWith: session.user?.email }).toArray()
    const responseVideos = videos.map((video) => {
      return {
        id: video._id,
        title: video.title,
        thumbnail: video.thumbnailUrl,
        progress: 100,
        user: {},
        }
      }
    )
  
    for (let i = 0; i < responseVideos.length; i++) {
      const user = await db.collection("users").findOne({ email: videos[i].userId })
      responseVideos[i].user = {
        name: user?.name,
        avatar: user?.image,
      }
    }
      return NextResponse.json(responseVideos)

  } catch (error) {
    console.error("Error fetching shared videos:", error)
    return NextResponse.json({ message: "Failed to fetch shared videos" }, { status: 500 })
  }
}

const getMyVideos = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const videos = await db.collection("videos").find({ userId: session.user?.email }).toArray()
    const responseVideos = videos.map((video) => {
      return {
        id: video._id,
        title: video.title,
        thumbnail: video.thumbnailUrl,
        progress: 100,
        isPublic: video.isPublic,
        videoId: video.videoId,
        user: {},
        }
      }
    )
  
    for (let i = 0; i < responseVideos.length; i++) {
      const user = await db.collection("users").findOne({ email: videos[i].userId })
      responseVideos[i].user = {
        name: user?.name,
        avatar: user?.image,
      }
    }
    return NextResponse.json(responseVideos)
  } catch (error) {
    console.error("Error fetching my videos:", error)
    return NextResponse.json({ message: "Failed to fetch my videos" }, { status: 500 })
  }
}