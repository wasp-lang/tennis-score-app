import * as z from 'zod'

import { Match, Set } from 'wasp/entities'
import { scoringPlayerSchema } from './validation'

type TennisPoint = '0' | '15' | '30' | '40' | 'A'

export type ScoringPlayer = z.infer<typeof scoringPlayerSchema>

/**
 * Calculates the new state of a tennis match after a point is scored
 * @param match Current match state including sets
 * @param scoringPlayer Which player scored (1 or 2)
 * @returns Updated match state
 */
export function calculateNewScoreState(
  match: Match & { sets: Set[] },
  scoringPlayer: ScoringPlayer
): MatchState {
  const player = scoringPlayer === 1 ? 'player1' : 'player2'
  const opponent = scoringPlayer === 1 ? 'player2' : 'player1'
  const score = match.score as {
    player1: { points: TennisPoint; games: number }
    player2: { points: TennisPoint; games: number }
  }

  const pointsState = calculateNewPoints(
    score[`${player}`].points,
    score[`${opponent}`].points,
    player,
    opponent
  )

  const gamesState = calculateNewGames(
    pointsState,
    score.player1.games,
    score.player2.games,
    player,
    opponent,
    match.server
  )

  return calculateNewSetAndMatch(
    gamesState,
    match.sets,
    match.currentSet,
    match.isComplete,
    scoringPlayer
  )
}

/**
 * Calculates new points after scoring
 */
function calculateNewPoints(
  playerPoints: TennisPoint,
  opponentPoints: TennisPoint,
  player: 'player1' | 'player2',
  opponent: 'player1' | 'player2'
): PointsResult {
  const nextPoints: TennisPoint[] = ['0', '15', '30', '40']

  // Case 1: Deuce to Advantage
  if (playerPoints === '40' && opponentPoints === '40') {
    return {
      [`${player}Points`]: 'A',
      [`${opponent}Points`]: opponentPoints,
      gameWon: false,
    } as unknown as PointsResult
  }

  // Case 2: Win game from 40 (opponent not at advantage)
  if (playerPoints === '40' && opponentPoints !== 'A') {
    return {
      [`${player}Points`]: '0',
      [`${opponent}Points`]: '0',
      gameWon: true,
    } as unknown as PointsResult
  }

  // Case 3: Back to deuce from opponent advantage
  if (opponentPoints === 'A') {
    return {
      [`${player}Points`]: playerPoints,
      [`${opponent}Points`]: '40',
      gameWon: false,
    } as unknown as PointsResult
  }

  // Case 4: Win game from advantage
  if (playerPoints === 'A') {
    return {
      [`${player}Points`]: '0',
      [`${opponent}Points`]: '0',
      gameWon: true,
    } as unknown as PointsResult
  }

  // Case 5: Normal point progression
  const currentIndex = nextPoints.indexOf(playerPoints)
  return {
    [`${player}Points`]: nextPoints[currentIndex + 1],
    [`${opponent}Points`]: opponentPoints,
    gameWon: false,
  } as unknown as PointsResult
}

/**
 * Calculates new games state based on points outcome
 */
function calculateNewGames(
  pointsResult: PointsResult,
  player1Games: number,
  player2Games: number,
  player: 'player1' | 'player2',
  opponent: 'player1' | 'player2',
  server: number
): GamesResult {
  if (!pointsResult.gameWon) {
    return {
      ...pointsResult,
      player1Games,
      player2Games,
      server,
      setWon: false,
    }
  }

  const newGames = {
    player1Games,
    player2Games,
  }

  newGames[`${player}Games`]++

  // Check for set win
  const setWon =
    newGames[`${player}Games`] >= 6
    && newGames[`${player}Games`] >= newGames[`${opponent}Games`] + 2

  return {
    ...pointsResult,
    ...newGames,
    server: server === 1 ? 2 : 1,
    setWon,
  }
}

/**
 * Calculates set and match state based on games outcome
 */
function calculateNewSetAndMatch(
  gamesResult: GamesResult,
  previousSets: Set[],
  currentSet: number,
  isComplete: boolean,
  scoringPlayer: ScoringPlayer
): MatchState {
  if (!gamesResult.setWon) {
    return {
      player1Points: gamesResult.player1Points,
      player2Points: gamesResult.player2Points,
      player1Games: gamesResult.player1Games,
      player2Games: gamesResult.player2Games,
      player1SetGames: 0,
      player2SetGames: 0,
      currentSet,
      server: gamesResult.server,
      isComplete,
      newSet: false,
    }
  }

  // Save set scores
  const player1SetGames = gamesResult.player1Games
  const player2SetGames = gamesResult.player2Games

  const playerSetsWon =
    previousSets.filter(
      (set) =>
        (scoringPlayer === 1 && set.player1Games > set.player2Games)
        || (scoringPlayer === 2 && set.player2Games > set.player1Games)
    ).length + 1 // +1 for this new set win

  return {
    player1Points: '0',
    player2Points: '0',
    player1Games: 0,
    player2Games: 0,
    player1SetGames,
    player2SetGames,
    currentSet: currentSet + 1,
    server: gamesResult.server,
    isComplete: playerSetsWon >= 2,
    newSet: true,
  }
}

interface PointsResult {
  player1Points: TennisPoint
  player2Points: TennisPoint
  gameWon: boolean
}

interface GamesResult extends PointsResult {
  player1Games: number
  player2Games: number
  server: number
  setWon: boolean
}

interface MatchState {
  player1Points: TennisPoint
  player2Points: TennisPoint
  player1Games: number
  player2Games: number
  currentSet: number
  isComplete: boolean
  server: number
  newSet: boolean
  player1SetGames: number
  player2SetGames: number
}
