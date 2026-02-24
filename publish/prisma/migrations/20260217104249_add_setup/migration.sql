-- CreateTable
CREATE TABLE "Setup" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "mainImage" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetupGallery" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "setupId" TEXT NOT NULL,

    CONSTRAINT "SetupGallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setup_slug_key" ON "Setup"("slug");

-- AddForeignKey
ALTER TABLE "SetupGallery" ADD CONSTRAINT "SetupGallery_setupId_fkey" FOREIGN KEY ("setupId") REFERENCES "Setup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
