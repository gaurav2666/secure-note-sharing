import { NextResponse } from "next/server";
import { headers } from "next/headers";
import mongoose from "mongoose";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import ShareLink from "@/models/ShareLink";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid note ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const note = await Note.findOne({
      _id: id,
      ownerId: session.user.id,
    }).lean();

    if (!note) {
      return NextResponse.json(
        { message: "Note not found" },
        { status: 404 }
      );
    }

    const shareLinks = await ShareLink.find({
      noteId: note._id,
      ownerId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      note: {
        id: note._id,
        title: note.title,
        content: note.content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },

      shareLinks: shareLinks.map((link) => ({
        id: link._id,
        token: link.token,
        shareType: link.shareType,
        accessType: link.accessType,
        expiresAt: link.expiresAt,
        viewCount: link.viewCount,
        usedAt: link.usedAt,
        revokedAt: link.revokedAt,
        createdAt: link.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get note error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}