-- CreateTable
CREATE TABLE "Welcome" (
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT,
    "custom_message" TEXT,

    CONSTRAINT "Welcome_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "guild_id" TEXT NOT NULL,
    "guild_name" TEXT NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("guild_id")
);

-- AddForeignKey
ALTER TABLE "Welcome" ADD CONSTRAINT "Welcome_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;
