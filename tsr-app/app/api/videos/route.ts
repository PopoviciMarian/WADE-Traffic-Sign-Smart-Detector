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

  const { videoId, videoUrl, thumbnailUrl, fps, length, frames} = await req.json();
 
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
      sharedWith: [  ],
      fps: Number(fps),
      thumbnailUrl: thumbnailUrl,
      length: Number(length),
      frames: frames

    }

    await db.collection("videos").insertOne(video)

    return  NextResponse.json({ message: "Video uploaded successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error uploading video:", error)
    return NextResponse.json({ message: "Failed to upload video" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode");

  if (!mode) {
    return NextResponse.json({ message: "Invalid mode" }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    const client = await clientPromise;
    const db = client.db();

    let filter = {};

    switch (mode) {
      case "public":
        filter = { isPublic: true };
        break;
      case "shared":
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        filter = { sharedWith: session.user?.email };
        break;
      case "my":
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        filter = { userId: session.user?.email };
        break;
      default:
        return NextResponse.json({ message: "Invalid mode" }, { status: 400 });
    }

    const videos = await fetchVideos(db, filter);
    return NextResponse.json(videos);
  } catch (error) {
    console.error(`Error fetching ${mode} videos:`, error);
    return NextResponse.json({ message: `Failed to fetch ${mode} videos` }, { status: 500 });
  }
}


const fetchVideos = async (db: any, filter: any) => {
  const videos = await db.collection("videos").find(filter).sort({ uploadedAt: -1 }).toArray();

  const responseVideos = videos.map((video: any) => ({
    id: video._id,
    title: video.title,
    thumbnail: video.thumbnailUrl,
    progress: 100,
    isPublic: video.isPublic ?? undefined,
    videoId: video.videoId ?? undefined,
    isProcessed: video.isProcessed ?? undefined,
    user: {},
  }));

  // Fetch user details in bulk instead of looping
  const userIds = [...new Set(videos.map((video: any) => video.userId))];
  const users = await db.collection("users").find({ email: { $in: userIds } }).toArray();
  const userMap = Object.fromEntries(users.map((user: any) => [user.email, { name: user.name, avatar: user.image }]));

  // Assign user data
  responseVideos.forEach((video: any, index: number) => {
    responseVideos[index].user = userMap[videos[index].userId] || {};
  });

  return responseVideos;
};