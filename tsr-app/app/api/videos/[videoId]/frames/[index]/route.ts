import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { Frame } from "@/models/Frame";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server"


export async function GET(request: Request, { params }: { params: { videoId: string; index: string } }) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }


    const videoId = params.videoId
    const index = parseInt(params.index)
    console.log("Video ID", videoId)
    console.log("Index", index)

    try {
        const client = await clientPromise
        const db = client.db()

        const frame = await db.collection("frames").findOne({ videoId: videoId, index: index })

        if (!frame) {
            return NextResponse.json({ message: "Frame not found" }, { status: 404 })
        }

        return NextResponse.json(frame)
    } catch (error) {
        console.error("Error fetching frame:", error)
        return NextResponse.json({ message: "Failed to fetch frame" }, { status: 500 })
    }
}