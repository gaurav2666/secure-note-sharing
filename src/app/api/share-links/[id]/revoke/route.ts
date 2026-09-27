import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ShareLink from "@/models/ShareLink";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    await connectDB();

    // 2. Only allow the owner to revoke their own link
    const shareLink = await ShareLink.findOne({
      _id: id,
      ownerId: session.user.id,
    });

    if (!shareLink) {
      return NextResponse.json(
        { message: "Share link not found" },
        { status: 404 }
      );
    }

    // 3. Already revoked
    if (shareLink.revokedAt) {
      return NextResponse.json(
        { message: "Share link is already revoked" },
        { status: 400 }
      );
    }

    // 4. Revoke
    shareLink.revokedAt = new Date();

    await shareLink.save();

    return NextResponse.json({
      success: true,
      message: "Share link revoked successfully",
    });
  } catch (error) {
    console.error("Revoke share link error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}