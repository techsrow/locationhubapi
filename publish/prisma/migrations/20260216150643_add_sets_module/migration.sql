-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mainImage" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetGallery" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "displayorder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "setId" TEXT NOT NULL,

    CONSTRAINT "SetGallery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SetGallery" ADD CONSTRAINT "SetGallery_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set"("id") ON DELETE CASCADE ON UPDATE CASCADE;
