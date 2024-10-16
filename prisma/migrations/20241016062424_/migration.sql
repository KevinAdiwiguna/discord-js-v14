-- CreateEnum
CREATE TYPE "ServerType" AS ENUM ('JAVA', 'BEDROCK');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('WELCOME', 'REMINDER');

-- CreateTable
CREATE TABLE "Guild" (
    "guild_id" TEXT NOT NULL,
    "guild_name" TEXT NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "Minecraft" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "server_name" TEXT NOT NULL,
    "server_address" TEXT NOT NULL,
    "server_port" INTEGER NOT NULL,
    "server_description" TEXT,
    "server_type" "ServerType" NOT NULL DEFAULT 'JAVA',

    CONSTRAINT "Minecraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "reminder_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT,
    "created_by" TEXT NOT NULL,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("reminder_id")
);

-- CreateTable
CREATE TABLE "Time" (
    "time_id" TEXT NOT NULL,
    "reminder_id" TEXT NOT NULL,
    "hour" TEXT NOT NULL,
    "minute" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" TEXT NOT NULL,

    CONSTRAINT "Time_pkey" PRIMARY KEY ("time_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "message_id" TEXT NOT NULL,
    "reminder_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "images_url" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "Welcome" (
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT,
    "message_id" TEXT NOT NULL,

    CONSTRAINT "Welcome_pkey" PRIMARY KEY ("guild_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_guild_id_key" ON "Guild"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "Time_reminder_id_key" ON "Time"("reminder_id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_reminder_id_key" ON "Message"("reminder_id");

-- CreateIndex
CREATE UNIQUE INDEX "Welcome_message_id_key" ON "Welcome"("message_id");

-- AddForeignKey
ALTER TABLE "Minecraft" ADD CONSTRAINT "Minecraft_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Time" ADD CONSTRAINT "Time_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "Reminder"("reminder_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "Reminder"("reminder_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Welcome" ADD CONSTRAINT "Welcome_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Welcome" ADD CONSTRAINT "Welcome_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Message"("message_id") ON DELETE CASCADE ON UPDATE CASCADE;
