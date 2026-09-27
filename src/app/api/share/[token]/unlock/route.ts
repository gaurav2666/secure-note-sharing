import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import ShareLink from "@/models/ShareLink";
import Note from "@/models/Note";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const body = await request.json();
    const { accessKey } = body;

    if (!accessKey) {
      return NextResponse.json(
        { message: "Access key is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const shareLink = await ShareLink.findOne({ token });

    if (!shareLink) {
      return NextResponse.json(
        { message: "Invalid share link" },
        { status: 404 }
      );
    }

    const now = new Date();

    // -----------------------------------------
    // REVOKED
    // -----------------------------------------
    if (shareLink.revokedAt) {
      return NextResponse.json(
        { message: "This share link has been revoked" },
        { status: 410 }
      );
    }

    // -----------------------------------------
    // EXPIRED
    // -----------------------------------------
    if (shareLink.expiresAt <= now) {
      return NextResponse.json(
        { message: "This share link has expired" },
        { status: 410 }
      );
    }

    // -----------------------------------------
    // ONE-TIME LINK ALREADY USED
    // -----------------------------------------
    if (shareLink.shareType === "one-time" && shareLink.usedAt) {
      return NextResponse.json(
        { message: "This one-time link has already been used" },
        { status: 410 }
      );
    }

    // -----------------------------------------
    // MAKE SURE THIS IS A PASSWORD LINK
    // -----------------------------------------
    if (shareLink.accessType !== "password") {
      return NextResponse.json(
        { message: "This share link does not require an access key" },
        { status: 400 }
      );
    }

    if (!shareLink.passwordHash) {
      return NextResponse.json(
        { message: "Access key is not configured" },
        { status: 500 }
      );
    }

    // -----------------------------------------
    // BRUTE-FORCE LOCK CHECK
    // -----------------------------------------
    if (
      shareLink.lockedUntil &&
      shareLink.lockedUntil > now
    ) {
      const remainingSeconds = Math.ceil(
        (shareLink.lockedUntil.getTime() - now.getTime()) / 1000
      );

      return NextResponse.json(
        {
          message: `Too many failed attempts. Try again in ${remainingSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // -----------------------------------------
    // CLEAR EXPIRED LOCK
    // -----------------------------------------
    if (
      shareLink.lockedUntil &&
      shareLink.lockedUntil <= now
    ) {
      shareLink.lockedUntil = null;
      shareLink.failedAttempts = 0;

      await shareLink.save();
    }

    // -----------------------------------------
    // VERIFY ACCESS KEY
    // -----------------------------------------
    const isValid = await bcrypt.compare(
      accessKey,
      shareLink.passwordHash
    );

    // -----------------------------------------
    // WRONG ACCESS KEY
    // -----------------------------------------
    if (!isValid) {
      const updatedLink = await ShareLink.findOneAndUpdate(
        {
          _id: shareLink._id,
          lockedUntil: null,
        },
        {
          $inc: {
            failedAttempts: 1,
          },
        },
        {
          new: true,
        }
      );

      if (
        updatedLink &&
        updatedLink.failedAttempts >= MAX_FAILED_ATTEMPTS
      ) {
        const lockedUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MS
        );

        await ShareLink.findByIdAndUpdate(
          shareLink._id,
          {
            $set: {
              lockedUntil,
            },
          }
        );

        return NextResponse.json(
          {
            message:
              "Too many failed attempts. This link has been temporarily locked for 5 minutes.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { message: "Invalid access key" },
        { status: 401 }
      );
    }

    // -----------------------------------------
    // SUCCESSFUL AUTHENTICATION
    // -----------------------------------------
    await ShareLink.findByIdAndUpdate(
      shareLink._id,
      {
        $set: {
          failedAttempts: 0,
          lockedUntil: null,
        },
      }
    );

    const note = await Note.findById(shareLink.noteId).lean();

    if (!note) {
      return NextResponse.json(
        { message: "Note not found" },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // ONE-TIME PASSWORD LINK
    // -----------------------------------------
    if (shareLink.shareType === "one-time") {
      const consumedLink = await ShareLink.findOneAndUpdate(
        {
          _id: shareLink._id,
          usedAt: null,
          revokedAt: null,
          expiresAt: { $gt: now },
        },
        {
          $set: {
            usedAt: now,
          },
          $inc: {
            viewCount: 1,
          },
        },
        {
          new: true,
        }
      );

      if (!consumedLink) {
        return NextResponse.json(
          {
            message:
              "This one-time link has already been used",
          },
          { status: 410 }
        );
      }

      return NextResponse.json({
        success: true,
        note: {
          title: note.title,
          content: note.content,
        },
        share: {
          shareType: consumedLink.shareType,
          expiresAt: consumedLink.expiresAt,
          viewCount: consumedLink.viewCount,
        },
      });
    }

    // -----------------------------------------
    // TIME-BASED PASSWORD LINK
    // -----------------------------------------
    const updatedLink = await ShareLink.findOneAndUpdate(
      {
        _id: shareLink._id,
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      {
        $inc: {
          viewCount: 1,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedLink) {
      return NextResponse.json(
        {
          message:
            "This share link has expired or been revoked",
        },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      note: {
        title: note.title,
        content: note.content,
      },
      share: {
        shareType: updatedLink.shareType,
        expiresAt: updatedLink.expiresAt,
        viewCount: updatedLink.viewCount,
      },
    });
  } catch (error) {
    console.error("Unlock share error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}