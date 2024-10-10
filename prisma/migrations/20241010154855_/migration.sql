/*
  Warnings:

  - You are about to drop the column `custom_message` on the `Welcome` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[guild_id]` on the table `Guild` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `message_id` to the `Welcome` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('WELCOME', 'REMINDER');

-- DropForeignKey
ALTER TABLE "Minecraft" DROP CONSTRAINT "Minecraft_guild_id_fkey";

-- DropForeignKey
ALTER TABLE "Welcome" DROP CONSTRAINT "Welcome_guild_id_fkey";

-- DropIndex
DROP INDEX "Minecraft_guild_id_server_name_key";

-- DropIndex
DROP INDEX "Minecraft_server_address_key";

-- AlterTable
ALTER TABLE "Minecraft" ALTER COLUMN "server_description" DROP NOT NULL,
ALTER COLUMN "server_version" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Welcome" DROP COLUMN "custom_message",
ADD COLUMN     "message_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Reminder" (
    "reminder_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "is_reminder" BOOLEAN NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "cooldown" BIGINT,
    "expiry_time" TIMESTAMP(3),

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("reminder_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "message_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_guild_id_key" ON "Guild"("guild_id");

-- AddForeignKey
ALTER TABLE "Minecraft" ADD CONSTRAINT "Minecraft_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("guild_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("guild_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Message"("message_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Welcome" ADD CONSTRAINT "Welcome_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("guild_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Welcome" ADD CONSTRAINT "Welcome_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Message"("message_id") ON DELETE RESTRICT ON UPDATE CASCADE;
