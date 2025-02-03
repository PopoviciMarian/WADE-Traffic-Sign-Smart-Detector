import type { ObjectId } from "mongodb"

export interface User {
    _id?: ObjectId
    name: string
    email: string
    image: string
    emailVerified: boolean
}

export const UserSchema = {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
}
