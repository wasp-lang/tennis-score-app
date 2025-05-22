import * as z from 'zod'

import { Match, Set } from 'wasp/entities'
import { HttpError } from 'wasp/server'
import {
  CreateMatch,
  GetMatch,
  GetMatches,
  UpdateMatchVisibility,
  UpdateScore,
} from 'wasp/server/operations'
import { calculateNewScoreState, ScoringPlayer } from './tennisLogic'
import {
  createMatchInputSchema,
  getMatchInputSchema,
  updateMatchVisibilitySchema,
  updateScoreInputSchema,
} from './validation'

export const getMatches = (async (_args, context) => {
  try {
    // Build filter condition based on user authentication status
    const whereCondition = context.user
      ? {
          OR: [{ isPublic: true }, { createdById: context.user.id }],
        }
      : { isPublic: true }

    const matches = await context.entities.Match.findMany({
      where: whereCondition,
      include: {
        sets: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return matches.map(formatMatchResponse)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return []
  }
}) satisfies GetMatches

export const getMatch = (async (rawArgs, context) => {
  try {
    const { matchId } = getMatchInputSchema.parse(rawArgs)
    const match = await context.entities.Match.findUnique({
      where: { id: matchId },
      include: {
        sets: true,
      },
    })

    if (!match) {
      throw new HttpError(404, 'Match not found')
    }

    return formatMatchResponse(match)
  } catch (error) {
    if (error instanceof HttpError) {
      throw error
    }
    if (error instanceof z.ZodError) {
      throw new HttpError(400, 'Invalid parameters')
    }
    throw new HttpError(500, 'Error fetching match details')
  }
}) satisfies GetMatch<{ matchId: string }>

export const createMatch = (async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in')
  }

  const { player1Name, player2Name, isPublic } =
    createMatchInputSchema.parse(rawArgs)

  try {
    const newMatch = await context.entities.Match.create({
      data: {
        player1Name,
        player2Name,
        isPublic,
        createdBy: { connect: { id: context.user.id } },
        score: {
          player1: {
            points: '0',
            games: 0,
          },
          player2: {
            points: '0',
            games: 0,
          },
        },
      },
      include: {
        sets: true,
      },
    })

    return formatMatchResponse(newMatch)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HttpError(400, 'Invalid parameters')
    }
    console.error('Error creating match:', error)
    throw new HttpError(500, 'Error creating the match')
  }
}) satisfies CreateMatch<{
  player1Name: string
  player2Name: string
  isPublic: boolean
}>

export const updateScore = (async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in')
  }

  const { matchId, scoringPlayer } = updateScoreInputSchema.parse(rawArgs)

  try {
    // Get current match state
    const match = await context.entities.Match.findUnique({
      where: { id: matchId },
      include: {
        sets: true,
      },
    })

    if (!match) {
      throw new HttpError(404, 'Match not found')
    }

    if (match.createdById !== context.user.id) {
      throw new HttpError(403, 'Only the match creator can update scores')
    }

    if (match.isComplete) {
      throw new HttpError(400, 'Cannot update a completed match')
    }

    const newState = calculateNewScoreState(match, scoringPlayer)

    // Update match with new state
    const updatedMatch = await context.entities.Match.update({
      where: { id: matchId },
      data: {
        score: {
          player1: {
            points: newState.player1Points,
            games: newState.player1Games,
          },
          player2: {
            points: newState.player2Points,
            games: newState.player2Games,
          },
        },
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
    })

    return formatMatchResponse(updatedMatch)
  } catch (error) {
    if (error instanceof HttpError) {
      throw error
    }
    if (error instanceof z.ZodError) {
      throw new HttpError(400, 'Invalid parameters')
    }
    console.error('Error updating score:', error)
    throw new HttpError(500, 'Error updating the score')
  }
}) satisfies UpdateScore<{ matchId: string; scoringPlayer: ScoringPlayer }>

export const updateMatchVisibility = (async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in')
  }

  const { matchId, isPublic } = updateMatchVisibilitySchema.parse(rawArgs)

  try {
    const match = await context.entities.Match.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      throw new HttpError(404, 'Match not found')
    }

    if (match.createdById !== context.user.id) {
      throw new HttpError(403, 'Only the match creator can change visibility')
    }

    // Update match visibility
    await context.entities.Match.update({
      where: { id: matchId },
      data: {
        isPublic,
      },
    })
  } catch (error) {
    if (error instanceof HttpError) {
      throw error
    }
    if (error instanceof z.ZodError) {
      throw new HttpError(400, 'Invalid parameters')
    }
    console.error('Error updating match visibility:', error)
    throw new HttpError(500, 'Error updating match visibility')
  }
}) satisfies UpdateMatchVisibility<{ matchId: string; isPublic: boolean }>

// Helper functions
function formatMatchResponse(match: Match & { sets: Set[] }) {
  // Step 2, read from new location
  const score = match.score as {
    player1: { points: string; games: number }
    player2: { points: string; games: number }
  }
  return {
    id: match.id,
    createdAt: match.createdAt.getTime(),
    isComplete: match.isComplete,
    isPublic: match.isPublic,
    currentSet: match.currentSet,
    server: match.server,
    createdBy: match.createdById,
    player1: {
      name: match.player1Name,
      points: score.player1.points,
      games: score.player1.games,
      sets: match.sets.map((set) => set.player1Games),
    },
    player2: {
      name: match.player2Name,
      points: score.player2.points,
      games: score.player2.games,
      sets: match.sets.map((set) => set.player2Games),
    },
  }
}
