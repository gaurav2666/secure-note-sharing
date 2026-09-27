import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShareLink from "@/models/ShareLink";
import Note from "@/models/Note";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    await connectDB();

    const shareLink = await ShareLink.findOne({ token });

    if (!shareLink) {
      return NextResponse.json(
        { message: "Invalid share link" },
        { status: 404 }
      );
    }

    const now = new Date();

    // Revoked
    if (shareLink.revokedAt) {
      return NextResponse.json(
        { message: "This share link has been revoked" },
        { status: 410 }
      );
    }

    // Expired
    if (shareLink.expiresAt <= now) {
      return NextResponse.json(
        { message: "This share link has expired" },
        { status: 410 }
      );
    }

    // Already-used one-time link
    if (shareLink.shareType === "one-time" && shareLink.usedAt) {
      return NextResponse.json(
        { message: "This one-time link has already been used" },
        { status: 410 }
      );
    }

    // Password-protected links are handled by the unlock API.
    if (shareLink.accessType === "password") {
      return NextResponse.json({
        requiresPassword: true,
      });
    }

    // Find the note before consuming the one-time link.
    const note = await Note.findById(shareLink.noteId).lean();

    if (!note) {
      return NextResponse.json(
        { message: "Note not found" },
        { status: 404 }
      );
    }

    /*
     * ONE-TIME PUBLIC LINK
     *
     * Atomically claim the link.
     * Only one request can change usedAt from null to a date.
     */
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
          { message: "This one-time link has already been used" },
          { status: 410 }
        );
      }

      return NextResponse.json({
        requiresPassword: false,
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

    /*
     * TIME-BASED PUBLIC LINK
     *
     * Every successful view increments the counter.
     */
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
        { message: "This share link has expired or been revoked" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      requiresPassword: false,
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
    console.error("Share access error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}