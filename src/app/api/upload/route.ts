import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename") || `upload-${Date.now()}`;

    // Get the file binary stream from the request body
    const contentType = request.headers.get("content-type") || "";
    
    let blob;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
      }
      blob = await put(file.name || filename, file, {
        access: "public",
      });
    } else {
      // Direct stream upload
      const fileBuffer = await request.arrayBuffer();
      if (!fileBuffer || fileBuffer.byteLength === 0) {
        return NextResponse.json({ error: "Empty file body" }, { status: 400 });
      }
      blob = await put(filename, fileBuffer, {
        access: "public",
        contentType: contentType || "image/png",
      });
    }

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Vercel Blob upload failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed uploading file to persistent cloud array." },
      { status: 500 }
    );
  }
}
