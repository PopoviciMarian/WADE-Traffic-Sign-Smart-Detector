import clientPromise from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function POST(req: NextRequest, { params }: { params: { videoId: string } }) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const videoId = params.videoId;
    const { isPublic } = await req.json();
    console.log(videoId, isPublic)
    if (!videoId || typeof videoId !== "string" || typeof isPublic !== "boolean") {
        return NextResponse.json({ message: "Invalid request" }, { status: 400 })
    }

    try {
        const client = await clientPromise
        const db = client.db()

        const result = await db
            .collection("videos")
            .updateOne({ videoId: videoId, userId: session.user?.email }, { $set: { isPublic: isPublic } })

        if (result.matchedCount === 0) {
            return NextResponse.json({ message: "Video not found or you don't have permission to update it" }, { status: 404 })
        }

        return NextResponse.json({ message: "Video privacy updated successfully" }, { status: 200 })
    } catch (error) {
        console.error("Error updating video privacy:", error)
        return NextResponse.json({ message: "Error updating video privacy" }, { status: 500 })
    }
}
