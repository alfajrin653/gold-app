-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SALES', 'MANAGEMENT');

-- CreateEnum
CREATE TYPE "TxType" AS ENUM ('BELI', 'JUAL');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "type" "TxType" NOT NULL,
    "status" "TxStatus" NOT NULL DEFAULT 'MENUNGGU',
    "salesId" INTEGER NOT NULL,
    "salesName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "counterpartyName" TEXT NOT NULL,
    "grams" DECIMAL(12,3) NOT NULL,
    "pricePerGram" DECIMAL(14,2) NOT NULL,
    "totalPrice" DECIMAL(16,2) NOT NULL,
    "karat" INTEGER NOT NULL,
    "accountNumber" TEXT,
    "photoGold" TEXT,
    "photoSaleProof" TEXT,
    "photoTransferProof" TEXT,
    "rejectNote" TEXT,
    "reviewedById" INTEGER,
    "reviewedByName" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "totalGrams" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "transactionId" INTEGER,
    "userId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_salesName_idx" ON "Transaction"("salesName");

-- CreateIndex
CREATE INDEX "Transaction_location_idx" ON "Transaction"("location");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_salesId_fkey" FOREIGN KEY ("salesId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
