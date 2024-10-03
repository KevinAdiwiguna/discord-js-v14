/*
  Warnings:

  - The primary key for the `Minecraft` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[guild_id,server_name]` on the table `Minecraft` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Minecraft` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Minecraft_server_name_key";

-- AlterTable
ALTER TABLE "Minecraft" DROP CONSTRAINT "Minecraft_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Minecraft_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Minecraft_guild_id_server_name_key" ON "Minecraft"("guild_id", "server_name");
