-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "currentSet" INTEGER NOT NULL DEFAULT 1,
    "server" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT NOT NULL,
    "player1Name" TEXT NOT NULL,
    "player2Name" TEXT NOT NULL,
    "player1Points" TEXT NOT NULL DEFAULT '0',
    "player2Points" TEXT NOT NULL DEFAULT '0',
    "player1Games" INTEGER NOT NULL DEFAULT 0,
    "player2Games" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "player1Games" INTEGER NOT NULL,
    "player2Games" INTEGER NOT NULL,
    "matchId" TEXT NOT NULL,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
