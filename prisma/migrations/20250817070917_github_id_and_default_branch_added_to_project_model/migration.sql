-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "default_branch" TEXT NOT NULL DEFAULT 'main',
ADD COLUMN     "github_id" INTEGER NOT NULL DEFAULT 0;
