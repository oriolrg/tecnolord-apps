SET search_path TO "biblioteca";

ALTER TABLE "Attachment"
  ADD COLUMN "originalName" TEXT,
  ADD COLUMN "storageName" TEXT,
  ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'inline',
  ADD COLUMN "altText" TEXT;

CREATE INDEX "Attachment_articleId_kind_idx" ON "Attachment"("articleId", "kind");
