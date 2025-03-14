import { MigrateToNewSchemaApi } from "wasp/server/api";
import { Prisma } from "@prisma/client";

export const migrateToNewSchema: MigrateToNewSchemaApi = async (
  _req,
  res,
  context
) => {
  const matchesWithoutJsonScore = await context.entities.Match.findMany({
    where: {
      score: {
        equals: Prisma.DbNull,
      },
    },
  });

  let updatedCount = 0;
  for (let match of matchesWithoutJsonScore) {
    await context.entities.Match.update({
      where: { id: match.id },
      data: {
        score: {
          player1: {
            points: match.player1Points,
            games: match.player1Games,
          },
          player2: {
            points: match.player2Points,
            games: match.player2Games,
          },
        },
      },
    });
    updatedCount++;
  }

  return res.json({ success: true, updatedCount });
};
