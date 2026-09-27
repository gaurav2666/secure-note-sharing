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
    // 1. Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Read request body
    const body = await request.json();

    const {
      noteId,
      shareType,
      accessType,
      expiresAt,
    } = body;

    // 3. Validate required fields
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

    // 4. Connect to database
    await connectDB();

    // 5. Make sure the note belongs to the logged-in user
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

    // 6. Validate expiry
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

    // 7. Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString("base64url");

    let accessKey: string | undefined;
    let passwordHash: string | undefined;

    if (accessType === "password") {
      accessKey = crypto.randomBytes(16).toString("base64url");

      passwordHash = await bcrypt.hash(accessKey, 12);
    }

    // 8. Create ShareLink
    const shareLink = await ShareLink.create({
      noteId: note._id,
      ownerId: session.user.id,
      token,
      shareType,
      accessType,
      expiresAt: expiryDate,
      passwordHash,

      // View tracking
      viewCount: 0,

      // Brute-force protection
      failedAttempts: 0,
      lockedUntil: null,

      // Link state
      usedAt: null,
      revokedAt: null,
    });

    // 9. Generate share URL
    const shareUrl = new URL(
      `/share/${token}`,
      request.url
    ).toString();

    // 10. Return share link details
    return NextResponse.json(
      {
        message: "Share link created successfully",
        shareLink: {
          id: shareLink._id,
          shareUrl,
          shareType: shareLink.shareType,
          accessType: shareLink.accessType,
          expiresAt: shareLink.expiresAt,

          // Only returned for password-protected links
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