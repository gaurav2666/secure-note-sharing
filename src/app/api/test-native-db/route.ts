import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    return NextResponse.json(
      { success: false, message: "MONGODB_URI is missing" },
      { status: 500 }
    );
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();

    await client.db("note_sharing_app").command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "Native MongoDB driver connected successfully!",
    });
  } catch (error) {
    console.error("Native MongoDB error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Native MongoDB connection failed",
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}