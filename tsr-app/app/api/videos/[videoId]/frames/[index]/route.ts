import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server"


export async function GET(request: Request, { params }: { params: { videoId: string; index: string } }) {

    const videoId = params.videoId
    const index = parseInt(params.index)
    
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