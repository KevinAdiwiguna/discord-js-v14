-- CreateTable
CREATE TABLE "Minecraft" (
    "guild_id" TEXT NOT NULL,
    "server_name" TEXT NOT NULL,
    "server_address" TEXT NOT NULL,
    "server_description" TEXT NOT NULL,
    "server_version" TEXT NOT NULL,

    CONSTRAINT "Minecraft_pkey" PRIMARY KEY ("guild_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Minecraft_server_name_key" ON "Minecraft"("server_name");

-- CreateIndex
CREATE UNIQUE INDEX "Minecraft_server_address_key" ON "Minecraft"("server_address");

-- AddForeignKey
ALTER TABLE "Minecraft" ADD CONSTRAINT "Minecraft_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;
