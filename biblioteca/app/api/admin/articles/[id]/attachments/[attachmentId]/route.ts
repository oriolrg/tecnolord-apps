import { NextResponse } from "next/server";
import { assertCsrf, requireAdminApi } from "@/lib/biblioteca/auth";
import { prisma } from "@/lib/biblioteca/db";
import { deleteUploadedImage, saveUploadedImage } from "@/lib/biblioteca/uploads";

async function findOwnedAttachment(articleId: string, attachmentId: string) {
  return prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      articleId
    }
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string; attachmentId: string } }) {
  let storedImage: Awaited<ReturnType<typeof saveUploadedImage>> | null = null;

  try {
    const admin = await requireAdminApi();
    if (!admin.ok) return admin.response;
    assertCsrf(request);

    const attachment = await findOwnedAttachment(params.id, params.attachmentId);
    if (!attachment) {
      return NextResponse.json({ error: "Imatge no trobada" }, { status: 404 });
    }

    const formData = await request.formData();
    const altText = String(formData.get("altText") ?? attachment.altText ?? "").trim();
    const file = formData.get("file");

    if (file instanceof File && file.size > 0) {
      storedImage = await saveUploadedImage(file);
    }

    const updated = await prisma.attachment.update({
      where: { id: attachment.id },
      data: storedImage
        ? {
            filename: storedImage.storageName,
            originalName: storedImage.originalName,
            storageName: storedImage.storageName,
            url: storedImage.url,
            mimeType: storedImage.mimeType,
            sizeBytes: storedImage.sizeBytes,
            altText
          }
        : {
            altText
          }
    });

    if (storedImage) {
      await deleteUploadedImage(attachment.storageName ?? attachment.filename);
    }

    return NextResponse.json({ attachment: updated });
  } catch (error) {
    if (storedImage) {
      await deleteUploadedImage(storedImage.storageName).catch(() => undefined);
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "No s'ha pogut actualitzar la imatge" }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; attachmentId: string } }) {
  try {
    const admin = await requireAdminApi();
    if (!admin.ok) return admin.response;
    assertCsrf(request);

    const force = new URL(request.url).searchParams.get("force") === "1";
    const attachment = await findOwnedAttachment(params.id, params.attachmentId);
    if (!attachment) {
      return NextResponse.json({ error: "Imatge no trobada" }, { status: 404 });
    }

    if (attachment.kind !== "cover" && !force) {
      const article = await prisma.article.findUnique({
        where: { id: params.id },
        select: { contentMarkdown: true }
      });

      if (article?.contentMarkdown.includes(attachment.url)) {
        return NextResponse.json(
          {
            error: "La imatge encara esta referenciada al Markdown. Confirma l'eliminacio per esborrar-la igualment.",
            referenced: true
          },
          { status: 409 }
        );
      }
    }

    await prisma.attachment.delete({ where: { id: attachment.id } });
    await deleteUploadedImage(attachment.storageName ?? attachment.filename);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No s'ha pogut eliminar la imatge" }, { status: 400 });
  }
}
