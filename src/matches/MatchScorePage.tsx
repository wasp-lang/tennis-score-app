import { ArrowLeft, Globe, Lock } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getMatch,
  updateMatchVisibility,
  updateScore,
  useAction,
  useQuery,
} from 'wasp/client/operations'

import { AuthUser } from 'wasp/auth'
import { TennisCourtVisualisation } from '../components/TennisCourt'
import { CurrentPoints } from './components/CurrentPoints'
import { FinalScore } from './components/FinalScore'
import { ResultTable } from './components/ResultTable'

export function MatchScorePage({ user }: { user: AuthUser }) {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()

  const {
    data: match,
    isLoading,
    error,
  } = useQuery(
    getMatch,
    { matchId: matchId! },
    {
      enabled: !!matchId,
    }
  )
  const updateScoreFn = useAction(updateScore)
  const updateVisibilityFn = useAction(updateMatchVisibility)

  const handleScore = async (player: 1 | 2) => {
    if (matchId) {
      try {
        await updateScoreFn({ matchId, scoringPlayer: player })
      } catch (error) {
        console.error('Failed to update score:', error)
        alert('Failed to update score.')
      }
    }
  }

  const handleToggleVisibility = async () => {
    if (matchId) {
      try {
        await updateVisibilityFn({
          matchId,
          isPublic: !match!.isPublic,
        })
      } catch (error) {
        console.error('Failed to update visibility:', error)
        alert('Failed to update match visibility.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading match...</div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-xl text-red-600">
          {error?.message || 'Match not found'}
        </div>
      </div>
    )
  }

  const { player1, player2 } = match
  const isOwner = match.createdBy === user.id

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl p-4">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="text-[#1B2838] transition-colors hover:text-[#2E5A27]"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-2xl font-bold text-[#1B2838]">Live Match</h1>
        </div>

        <TennisCourtVisualisation
          className="h-64 md:h-96"
          player1Name={player1.name}
          player2Name={player2.name}
        />

        <div className="relative rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-end">
            {isOwner && (
              <button
                onClick={handleToggleVisibility}
                className="flex items-center gap-1 rounded-full border px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-forest"
                title={match.isPublic ? 'Change to private' : 'Make public'}
              >
                {match.isPublic ? (
                  <>
                    <Globe className="h-4 w-4" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Private
                  </>
                )}
              </button>
            )}
          </div>

          {match.isComplete && <FinalScore match={match} />}
          {!match.isComplete && <CurrentPoints match={match} />}

          {/* Score board in tennis style */}
          <div className="mb-8 overflow-hidden rounded-lg border">
            <ResultTable match={match} />
          </div>

          {match.isComplete ? (
            <div className="py-4 text-center text-lg font-bold text-[#2E5A27]">
              Match Complete
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleScore(1)}
                className="rounded-lg bg-[#2E5A27] px-6 py-4 text-white transition-colors hover:bg-[#234420]"
              >
                Point for {player1.name}
              </button>
              <button
                onClick={() => handleScore(2)}
                className="rounded-lg bg-[#2E5A27] px-6 py-4 text-white transition-colors hover:bg-[#234420]"
              >
                Point for {player2.name}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
