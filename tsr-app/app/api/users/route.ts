import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import clientPromise from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const query = req.nextUrl.searchParams.get('query');
    if (!query || typeof query !== "string") {
        return NextResponse.json({ message: "Invalid query" }, { status: 400 })
    }

    try {
        const client = await clientPromise
        const db = client.db()

        const users = await db
            .collection("users")
            .find({
                email: { $regex: query, $options: "i" },
            })
            .limit(5)
            .toArray()

        const sanitizedUsers = users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
        }))
        return NextResponse.json(sanitizedUsers)

    } catch (error) {
        console.error("Error fetching uses:", error)
        return NextResponse.json({ message: "Error fetching users" }, { status: 500 })
    }
}


