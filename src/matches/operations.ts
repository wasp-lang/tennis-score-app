import { Match, Set } from "wasp/entities";
import { HttpError } from "wasp/server";
import {
  CreateMatch,
  GetMatch,
  GetMatches,
  UpdateScore,
} from "wasp/server/operations";

type TennisPoint = "0" | "15" | "30" | "40" | "A";
type PointsValue = 0 | 1 | 2 | 3 | 4; // numerical representation of points

// Queries
export const getMatches = (async (_args, context) => {
  try {
    const matches = await context.entities.Match.findMany({
      include: {
        sets: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return matches.map(formatMatchResponse);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}) satisfies GetMatches;

export const getMatch = (async ({ matchId }, context) => {
  if (!matchId) {
    throw new HttpError(400, "Match ID is required");
  }

  try {
    const match = await context.entities.Match.findUnique({
      where: { id: matchId },
      include: {
        sets: true,
      },
    });

    if (!match) {
      throw new HttpError(404, "Match not found");
    }

    return formatMatchResponse(match);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, "Error fetching match details");
  }
}) satisfies GetMatch<{ matchId: string }>;

export const createMatch = (async ({ player1Name, player2Name }, context) => {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in");
  }

  if (!player1Name || !player2Name) {
    throw new HttpError(400, "Both player names are required");
  }

  try {
    const newMatch = await context.entities.Match.create({
      data: {
        player1Name,
        player2Name,
        createdBy: { connect: { id: context.user.id } },
      },
      include: {
        sets: true,
      },
    });

    return formatMatchResponse(newMatch);
  } catch (error) {
    console.error("Error creating match:", error);
    throw new HttpError(500, "Error creating the match");
  }
}) satisfies CreateMatch<{ player1Name: string; player2Name: string }>;

export const updateScore = (async ({ matchId, scoringPlayer }, context) => {
  if (!context.user) {
    throw new HttpError(401, "You must be logged in");
  }

  if (!matchId || ![1, 2].includes(scoringPlayer)) {
    throw new HttpError(400, "Invalid parameters");
  }

  try {
    // Get current match state
    const match = await context.entities.Match.findUnique({
      where: { id: matchId },
      include: {
        sets: true,
      },
    });

    if (!match) {
      throw new HttpError(404, "Match not found");
    }

    // Authorization check
    if (match.createdById !== context.user.id) {
      throw new HttpError(403, "Only the match creator can update scores");
    }

    if (match.isComplete) {
      throw new HttpError(400, "Cannot update a completed match");
    }

    // Calculate new score state
    const newState = calculateNewScoreState(match, scoringPlayer);

    // Update match with new state
    const updatedMatch = await context.entities.Match.update({
      where: { id: matchId },
      data: {
        player1Points: newState.player1Points,
        player2Points: newState.player2Points,
        player1Games: newState.player1Games,
        player2Games: newState.player2Games,
        currentSet: newState.currentSet,
        isComplete: newState.isComplete,
        server: newState.server,
        // Create new set if needed
        sets: newState.newSet
          ? {
              create: {
                setNumber: match.currentSet,
                player1Games: newState.player1SetGames,
                player2Games: newState.player2SetGames,
              },
            }
          : undefined,
      },
      include: {
        sets: true,
      },
    });

    return formatMatchResponse(updatedMatch);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error("Error updating score:", error);
    throw new HttpError(500, "Error updating the score");
  }
}) satisfies UpdateScore<{ matchId: string; scoringPlayer: number }>;

// Helper functions
function formatMatchResponse(match: Match & { sets: Set[] }) {
  return {
    id: match.id,
    createdAt: match.createdAt.getTime(),
    isComplete: match.isComplete,
    currentSet: match.currentSet,
    server: match.server,
    createdBy: match.createdById,
    player1: {
      name: match.player1Name,
      points: match.player1Points,
      games: match.player1Games,
      sets: match.sets.map((set) => set.player1Games),
    },
    player2: {
      name: match.player2Name,
      points: match.player2Points,
      games: match.player2Games,
      sets: match.sets.map((set) => set.player2Games),
    },
  };
}

function calculateNewScoreState(
  match: Match & { sets: Set[] },
  scoringPlayer: number
) {
  const state = {
    player1Points: match.player1Points as TennisPoint,
    player2Points: match.player2Points as TennisPoint,
    player1Games: match.player1Games,
    player2Games: match.player2Games,
    currentSet: match.currentSet,
    isComplete: match.isComplete,
    server: match.server,
    newSet: false,
    player1SetGames: 0,
    player2SetGames: 0,
  };

  const player = scoringPlayer === 1 ? "player1" : "player2";
  const opponent = scoringPlayer === 1 ? "player2" : "player1";

  // Type-safe point system
  const pointsSystem: Record<TennisPoint, PointsValue> = {
    "0": 0,
    "15": 1,
    "30": 2,
    "40": 3,
    A: 4,
  };

  const nextPoints: TennisPoint[] = ["0", "15", "30", "40"];

  // Update points with type safety
  if (
    state[`${player}Points`] === "40" &&
    state[`${opponent}Points`] === "40"
  ) {
    state[`${player}Points`] = "A";
  } else if (
    state[`${player}Points`] === "40" &&
    state[`${opponent}Points`] !== "A"
  ) {
    // Win game
    state[`${player}Points`] = "0";
    state[`${opponent}Points`] = "0";
    state[`${player}Games`]++;
    state.server = state.server === 1 ? 2 : 1;
  } else if (state[`${opponent}Points`] === "A") {
    state[`${opponent}Points`] = "40";
  } else if (state[`${player}Points`] === "A") {
    // Win game
    state[`${player}Points`] = "0";
    state[`${opponent}Points`] = "0";
    state[`${player}Games`]++;
    state.server = state.server === 1 ? 2 : 1;
  } else {
    // Normal point progression with type safety
    const currentPointValue = pointsSystem[state[`${player}Points`]];
    state[`${player}Points`] = nextPoints[currentPointValue + 1];
  }

  // Check for set win
  if (
    state[`${player}Games`] >= 6 &&
    state[`${player}Games`] >= state[`${opponent}Games`] + 2
  ) {
    // Save the set scores
    state.player1SetGames = state.player1Games;
    state.player2SetGames = state.player2Games;

    // Reset for new set
    state.player1Games = 0;
    state.player2Games = 0;
    state.currentSet++;
    state.newSet = true;

    // Check for match win (best of 3 sets)
    const playerSetsWon =
      match.sets.filter(
        (set) =>
          (scoringPlayer === 1 && set.player1Games > set.player2Games) ||
          (scoringPlayer === 2 && set.player2Games > set.player1Games)
      ).length + 1; // +1 for this new set win

    if (playerSetsWon >= 2) {
      state.isComplete = true;
    }
  }

  return state;
}
