-- CreateTable
CREATE TABLE "GroomGallery" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "displayorder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroomGallery_pkey" PRIMARY KEY ("id")
);
