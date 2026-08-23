import { NextResponse } from "next/server";
import { readUploadedImage } from "@/lib/biblioteca/uploads";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { path: string[] } }) {
  try {
    const storageName = params.path.join("/");
    const image = await readUploadedImage(storageName);
    const extension = storageName.split(".").pop();
    const contentType =
      extension === "jpg" ? "image/jpeg" : extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "application/octet-stream";

    return new NextResponse(image, {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Imatge no trobada", { status: 404 });
  }
}
