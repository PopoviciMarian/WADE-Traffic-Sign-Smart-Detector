import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { videoId: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const videoId = params.videoId

    try {
        const client = await clientPromise
        const db = client.db()

        const video = await db.collection("videos").findOne({ videoId: videoId })

        if (!video) {
            return NextResponse.json({ message: "Video not found" }, { status: 404 })
        }

        return NextResponse.json(video)
    }
    catch (error) {
        console.error("Error fetching video:", error)
        return NextResponse.json({ message: "Failed to fetch video" }, { status: 500 })
    }
}


