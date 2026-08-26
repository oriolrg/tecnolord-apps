import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const uploadsRoot = process.env.BIBLIOTECA_UPLOADS_DIR || "/app/uploads";
export const maxImageBytes = Number(process.env.BIBLIOTECA_MAX_IMAGE_BYTES || 2 * 1024 * 1024);

const allowedTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
} as const;

export type AllowedImageMime = keyof typeof allowedTypes;

export type StoredImage = {
  originalName: string;
  storageName: string;
  url: string;
  mimeType: AllowedImageMime;
  sizeBytes: number;
};

function extensionFromName(name: string) {
  return path.extname(name).replace(".", "").toLowerCase();
}

function detectMime(buffer: Buffer): AllowedImageMime | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

export function publicImageUrl(storageName: string) {
  return `/biblioteca/api/uploads/${storageName}`;
}

export function safeUploadPath(storageName: string) {
  if (!/^[a-f0-9-]+\.(jpg|png|webp)$/.test(storageName)) {
    throw new Error("Nom de fitxer invalid");
  }

  const resolvedRoot = path.resolve(uploadsRoot);
  const resolvedFile = path.resolve(resolvedRoot, storageName);
  if (!resolvedFile.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("Ruta de fitxer invalida");
  }

  return resolvedFile;
}

export async function saveUploadedImage(file: File): Promise<StoredImage> {
  if (!file.size) {
    throw new Error("El fitxer esta buit");
  }
  if (file.size > maxImageBytes) {
    throw new Error(`La imatge supera el limit de ${Math.round(maxImageBytes / 1024 / 1024)} MB`);
  }

  const extension = extensionFromName(file.name);
  if (!["jpg", "jpeg", "png", "webp"].includes(extension)) {
    throw new Error("Extensio no permesa. Formats acceptats: JPEG, PNG i WebP");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = detectMime(buffer);

  if (!mimeType) {
    throw new Error("El fitxer no sembla una imatge JPEG, PNG o WebP valida");
  }

  if (file.type && file.type !== mimeType) {
    throw new Error("El MIME declarat no coincideix amb el contingut real");
  }

  const expectedExtension = allowedTypes[mimeType];
  const normalizedExtension = expectedExtension === "jpg" && extension === "jpeg" ? "jpg" : extension;
  if (normalizedExtension !== expectedExtension) {
    throw new Error("L'extensio no coincideix amb el format real de la imatge");
  }

  await mkdir(uploadsRoot, { recursive: true });
  const storageName = `${randomUUID()}.${expectedExtension}`;
  await writeFile(safeUploadPath(storageName), buffer, { flag: "wx" });

  return {
    originalName: path.basename(file.name),
    storageName,
    url: publicImageUrl(storageName),
    mimeType,
    sizeBytes: buffer.byteLength
  };
}

export async function readUploadedImage(storageName: string) {
  return readFile(safeUploadPath(storageName));
}

export async function deleteUploadedImage(storageName?: string | null) {
  if (!storageName) return;

  try {
    await unlink(safeUploadPath(storageName));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw error;
    }
  }
}
