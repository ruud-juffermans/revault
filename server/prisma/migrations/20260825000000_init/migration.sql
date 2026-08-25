-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "IntakeStatus" AS ENUM ('NEW', 'ASSESSED', 'VIABLE', 'NOT_VIABLE', 'AGREEMENT', 'RECOVERY', 'CLOSED');

-- CreateTable
CREATE TABLE "Intake" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "walletType" TEXT NOT NULL,
    "walletSoftware" TEXT,
    "issueType" TEXT NOT NULL,
    "estimatedValue" TEXT,
    "description" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "status" "IntakeStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Intake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "locale" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Intake_reference_key" ON "Intake"("reference");

-- CreateIndex
CREATE INDEX "Intake_status_createdAt_idx" ON "Intake"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

