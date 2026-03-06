-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('LIVING_ROOM', 'BEDROOM', 'DINING_ROOM', 'HOME_OFFICE', 'NURSERY');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('SOFA', 'ARMCHAIR', 'COFFEE_TABLE', 'SIDE_TABLE', 'DINING_TABLE', 'DINING_CHAIR', 'BED_FRAME', 'DRESSER', 'BOOKSHELF', 'DESK', 'DESK_CHAIR', 'FLOOR_LAMP', 'TABLE_LAMP', 'RUG', 'ARTWORK', 'MIRROR', 'STORAGE', 'ACCENT_PIECE');

-- CreateEnum
CREATE TYPE "StepName" AS ENUM ('PROFILE', 'ROOMS', 'STYLE', 'BUDGET', 'RECOMMENDATIONS', 'PLAN', 'REFINE', 'COMPLETE');

-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('LIKE', 'DISLIKE', 'SKIP');

-- CreateTable
CREATE TABLE "Retailer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#1a1a2e',
    "accentColor" TEXT NOT NULL DEFAULT '#e94560',
    "contactEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Retailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "room" "RoomType"[],
    "priceUsd" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "styleIds" TEXT[],
    "colorFamily" TEXT[],
    "materialTags" TEXT[],
    "dimensions" JSONB,
    "inStock" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "shopperName" TEXT,
    "email" TEXT,
    "address" TEXT,
    "addressMeta" JSONB,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "selectedRooms" "RoomType"[],
    "designStyle" TEXT,
    "colorPalette" TEXT[],
    "budgetCents" JSONB,
    "currentStep" "StepName" NOT NULL DEFAULT 'PROFILE',
    "completedAt" TIMESTAMP(3),
    "resumeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Swipe" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "room" "RoomType" NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Swipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "styleRationale" TEXT NOT NULL,
    "layoutJson" JSONB NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "refinements" JSONB NOT NULL DEFAULT '[]',
    "emailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "room" "RoomType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "noteFromAI" TEXT,
    "position" JSONB,

    CONSTRAINT "PlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Retailer_slug_key" ON "Retailer"("slug");

-- CreateIndex
CREATE INDEX "Product_retailerId_category_idx" ON "Product"("retailerId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Session_resumeToken_key" ON "Session"("resumeToken");

-- CreateIndex
CREATE INDEX "Session_email_idx" ON "Session"("email");

-- CreateIndex
CREATE INDEX "Session_resumeToken_idx" ON "Session"("resumeToken");

-- CreateIndex
CREATE INDEX "Session_retailerId_idx" ON "Session"("retailerId");

-- CreateIndex
CREATE INDEX "Swipe_sessionId_room_direction_idx" ON "Swipe"("sessionId", "room", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "Swipe_sessionId_productId_key" ON "Swipe"("sessionId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_shareToken_key" ON "Plan"("shareToken");

-- CreateIndex
CREATE INDEX "Plan_shareToken_idx" ON "Plan"("shareToken");

-- CreateIndex
CREATE INDEX "Plan_sessionId_idx" ON "Plan"("sessionId");

-- CreateIndex
CREATE INDEX "PlanItem_planId_room_idx" ON "PlanItem"("planId", "room");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Swipe" ADD CONSTRAINT "Swipe_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanItem" ADD CONSTRAINT "PlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanItem" ADD CONSTRAINT "PlanItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
