import { TennisBall } from '../../icons/TennisBall'
import { cn } from '../../tailwind'
import { Match } from '../types'

export function CurrentPoints({ match }: { match: Match }) {
  return (
    <div className="mb-4 grid grid-cols-3 gap-4">
      <div className="text-center">
        <div
          className={cn(
            'flex items-center justify-center font-medium text-navy',
            !match.isComplete && match.server === 1 && 'font-bold text-forest'
          )}
        >
          {!match.isComplete && match.server === 1 && (
            <TennisBall className="mr-1 h-4 w-4 text-yellow-400" />
          )}
          {match.player1.name}
        </div>
        <div className="text-2xl font-bold text-forest">
          {match.player1.points}
        </div>
      </div>
      <div className="flex items-center justify-center text-center">
        <div className="text-sm text-gray-500">Current game</div>
      </div>
      <div className="text-center">
        <div
          className={cn(
            'flex items-center justify-center font-medium text-navy',
            !match.isComplete && match.server === 2 && 'font-bold text-forest'
          )}
        >
          {match.player2.name}
          {!match.isComplete && match.server === 2 && (
            <TennisBall className="ml-1 h-4 w-4 text-yellow-400" />
          )}
        </div>
        <div className="text-2xl font-bold text-forest">
          {match.player2.points}
        </div>
      </div>
    </div>
  )
}
