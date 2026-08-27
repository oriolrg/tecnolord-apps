import { NextResponse } from "next/server";
import { assertCsrf, requireAdminApi } from "@/lib/biblioteca/auth";
import { prisma } from "@/lib/biblioteca/db";
import { deleteUploadedImage, saveUploadedImage } from "@/lib/biblioteca/uploads";

function sanitizeKind(value: FormDataEntryValue | null) {
  return value === "cover" ? "cover" : "inline";
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminApi();
  if (!admin.ok) return admin.response;
  const article = await prisma.article.findUnique({
    where: { id: params.id },
    select: { id: true }
  });

  if (!article) {
    return NextResponse.json({ error: "Article no trobat" }, { status: 404 });
  }

  const attachments = await prisma.attachment.findMany({
    where: { articleId: params.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ attachments });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  let storedImage: Awaited<ReturnType<typeof saveUploadedImage>> | null = null;

  try {
    const admin = await requireAdminApi();
    if (!admin.ok) return admin.response;
    assertCsrf(request);

    const article = await prisma.article.findUnique({
      where: { id: params.id },
      select: { id: true }
    });
    if (!article) {
      return NextResponse.json({ error: "Article no trobat" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta el fitxer d'imatge" }, { status: 400 });
    }

    const kind = sanitizeKind(formData.get("kind"));
    const altText = String(formData.get("altText") ?? "").trim();
    storedImage = await saveUploadedImage(file);

    if (kind === "cover") {
      const previousCover = await prisma.attachment.findFirst({
        where: { articleId: params.id, kind: "cover" }
      });

      const attachment = await prisma.$transaction(async (tx) => {
        if (previousCover) {
          await tx.attachment.delete({ where: { id: previousCover.id } });
        }

        return tx.attachment.create({
          data: {
            articleId: params.id,
            filename: storedImage!.storageName,
            originalName: storedImage!.originalName,
            storageName: storedImage!.storageName,
            url: storedImage!.url,
            mimeType: storedImage!.mimeType,
            sizeBytes: storedImage!.sizeBytes,
            kind,
            altText
          }
        });
      });

      if (previousCover) {
        await deleteUploadedImage(previousCover.storageName ?? previousCover.filename);
      }

      return NextResponse.json({ attachment });
    }

    const attachment = await prisma.attachment.create({
      data: {
        articleId: params.id,
        filename: storedImage.storageName,
        originalName: storedImage.originalName,
        storageName: storedImage.storageName,
        url: storedImage.url,
        mimeType: storedImage.mimeType,
        sizeBytes: storedImage.sizeBytes,
        kind,
        altText
      }
    });

    return NextResponse.json({ attachment });
  } catch (error) {
    if (storedImage) {
      await deleteUploadedImage(storedImage.storageName).catch(() => undefined);
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "No s'ha pogut pujar la imatge" }, { status: 400 });
  }
}
