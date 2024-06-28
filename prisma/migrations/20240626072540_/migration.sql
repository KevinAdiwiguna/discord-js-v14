-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "roleId" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_roleId_key" ON "Roles"("roleId");
