import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { AuthUser } from 'wasp/auth'
import { logout, useAuth } from 'wasp/client/auth'
import { getMatches, useQuery } from 'wasp/client/operations'
import { Link } from 'wasp/client/router'
import { cn } from '../tailwind'
import { CurrentPoints } from './components/CurrentPoints'
import { FinalScore } from './components/FinalScore'
import { ResultTable } from './components/ResultTable'
import type { Match } from './types'

export function IndexPage() {
  const navigate = useNavigate()
  const { data: user } = useAuth()
  const { data: matches, isLoading } = useQuery(
    getMatches,
    {},
    {
      refetchInterval: 5000,
    }
  )

  // Split matches into live and completed
  const liveMatches = matches?.filter((match) => !match.isComplete) || []
  const completedMatches = matches?.filter((match) => match.isComplete) || []

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-navy">Tennis Matches</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <Link
              to="/new"
              className="flex items-center rounded-md bg-forest px-4 py-2 text-white no-underline transition-colors hover:bg-[#234420]"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Match
            </Link>
            <Link
              to="/profile"
              className="rounded-md bg-blue-600 px-4 py-2 text-white no-underline transition-colors hover:bg-blue-700"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400"
            >
              Logout
            </button>
          </div>
        )}
        {!user && (
          <Link
            to="/login"
            className="flex items-center rounded-md bg-forest px-4 py-2 text-white no-underline transition-colors hover:bg-[#234420]"
          >
            Login
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-md">
          Loading matches...
        </div>
      ) : !matches || matches.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-md">
          No matches found. Start a new match to begin scoring.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Live Matches Section */}
          <div>
            <h2 className="mb-4 flex items-center text-xl font-semibold text-navy">
              <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Live Matches
            </h2>
            <div className="space-y-4">
              {liveMatches.length === 0 ? (
                <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-md">
                  No live matches at the moment.
                </div>
              ) : (
                liveMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isClickable={!!user && user.id === match.createdBy}
                    onClick={() => navigate(`/match/${match.id}`)}
                    user={user}
                  />
                ))
              )}
            </div>
          </div>

          {/* Completed Matches Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-navy">
              Completed Matches
            </h2>
            <div className="space-y-4">
              {completedMatches.length === 0 ? (
                <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-md">
                  No completed matches yet.
                </div>
              ) : (
                completedMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isClickable={!!user && user.id === match.createdBy}
                    onClick={() => navigate(`/match/${match.id}`)}
                    user={user}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MatchCard({
  match,
  isClickable,
  onClick,
  user,
}: {
  match: Match
  isClickable: boolean
  onClick?: () => void
  user?: AuthUser | null
}) {
  const isUserMatch = user && user.id === match.createdBy

  return (
    <div
      key={match.id}
      onClick={isClickable ? onClick : undefined}
      onKeyUp={isClickable ? onClick : undefined}
      className={cn(
        'rounded-lg bg-white p-6 shadow-md',
        isClickable && 'cursor-pointer transition-shadow hover:shadow-lg'
      )}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Started at {formatTime(match.createdAt)}
        </div>
        <div className="flex gap-2">
          <div
            className={cn(
              'flex items-center rounded-full px-3 py-1 text-sm',
              match.isComplete
                ? 'bg-gray-100 text-gray-600'
                : 'bg-green-100 text-green-600'
            )}
          >
            {match.isComplete ? (
              'Completed'
            ) : (
              <>
                <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Live
              </>
            )}
          </div>
          {isUserMatch && (
            <div className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
              Your match
            </div>
          )}
        </div>
      </div>

      {match.isComplete && <FinalScore match={match} />}
      {!match.isComplete && <CurrentPoints match={match} />}

      <div className="overflow-hidden rounded-lg border">
        <ResultTable match={match} />
      </div>
    </div>
  )
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
