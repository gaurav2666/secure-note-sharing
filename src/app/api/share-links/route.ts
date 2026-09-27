import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Note from "@/models/Note";
import ShareLink from "@/models/ShareLink";

export async function POST(request: Request) {
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

    const body = await request.json();

    const { noteId, shareType, accessType, expiresAt } = body;

    if (!noteId || !shareType || !accessType || !expiresAt) {
      return NextResponse.json(
        {
          message:
            "noteId, shareType, accessType and expiresAt are required",
        },
        { status: 400 }
      );
    }

    if (!["one-time", "time-based"].includes(shareType)) {
      return NextResponse.json(
        { message: "Invalid share type" },
        { status: 400 }
      );
    }

    if (!["public", "password"].includes(accessType)) {
      return NextResponse.json(
        { message: "Invalid access type" },
        { status: 400 }
      );
    }

    await connectDB();

    const note = await Note.findOne({
      _id: noteId,
      ownerId: session.user.id,
    });

    if (!note) {
      return NextResponse.json(
        { message: "Note not found" },
        { status: 404 }
      );
    }

    const expiryDate = new Date(expiresAt);

    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid expiry date" },
        { status: 400 }
      );
    }

    if (expiryDate <= new Date()) {
      return NextResponse.json(
        { message: "Expiry must be in the future" },
        { status: 400 }
      );
    }

    // Generate secure share token
    const token = crypto.randomBytes(32).toString("base64url");

    let accessKey: string | undefined;
    let passwordHash: string | undefined;

    // Generate access key only for password-protected links
    if (accessType === "password") {
      accessKey = crypto.randomBytes(16).toString("base64url");

      passwordHash = await bcrypt.hash(accessKey, 12);
    }

    // Create share link AFTER all values above have been prepared
    const shareLink = await ShareLink.create({
      noteId: note._id,
      ownerId: session.user.id,
      token,
      shareType,
      accessType,
      expiresAt: expiryDate,
      passwordHash,
      viewCount: 0,
      failedAttempts: 0,
      lockedUntil: null,
      usedAt: null,
      revokedAt: null,
    });

    // Generate the share URL AFTER the share link/token exists
    const shareUrl = new URL(
      `/share/${token}`,
      request.url
    ).toString();

    return NextResponse.json(
      {
        message: "Share link created successfully",

        shareLink: {
          id: shareLink._id,
          shareUrl,
          shareType: shareLink.shareType,
          accessType: shareLink.accessType,
          expiresAt: shareLink.expiresAt,
          accessKey,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create share link error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}