-- CreateTable
CREATE TABLE "MakeupArtist" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MakeupArtist_pkey" PRIMARY KEY ("id")
);
