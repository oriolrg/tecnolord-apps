SET search_path TO "biblioteca";

CREATE TYPE "UserRole" AS ENUM ('admin', 'editor');

ALTER TABLE "User"
  ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'admin';

ALTER TABLE "User"
  ALTER COLUMN "role" SET DEFAULT 'editor';
