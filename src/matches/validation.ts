import * as z from "zod";

export const getMatchInputSchema = z.object({
  matchId: z.string(),
});

export const createMatchInputSchema = z.object({
  player1Name: z.string().min(1, { message: "Player 1 name is required" }),
  player2Name: z.string().min(1, { message: "Player 2 name is required" }),
});

export const scoringPlayerSchema = z.literal(1).or(z.literal(2));

export const updateScoreInputSchema = z.object({
  matchId: z.string(),
  scoringPlayer: scoringPlayerSchema,
});
