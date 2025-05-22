import { cn } from '../../tailwind'
import { Match } from '../types'

export function ResultTable({ match }: { match: Match }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-2 pl-4 text-left">Player</th>
          {match.player1.sets.map((_, i) => (
            <th key={i} className="w-16 py-2 text-center">
              S{i + 1}
            </th>
          ))}
          {!match.isComplete && (
            <>
              <th className="w-16 py-2 text-center">Games</th>
              <th className="w-16 py-2 text-center">Points</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        <tr className="border-t">
          <td className="py-2 pl-4 font-medium">{match.player1.name}</td>
          {match.player1.sets.map((set, i) => (
            <td
              key={i}
              className={cn(
                'py-2 text-center',
                i === match.currentSet && 'font-bold'
              )}
            >
              {set}
            </td>
          ))}
          {!match.isComplete && (
            <>
              <td className="py-2 text-center font-medium">
                {match.player1.games}
              </td>
              <td className="py-2 text-center font-medium">
                {match.player1.points}
              </td>
            </>
          )}
        </tr>
        <tr className="border-t">
          <td className="py-2 pl-4 font-medium">{match.player2.name}</td>
          {match.player2.sets.map((set, i) => (
            <td
              key={i}
              className={cn(
                'py-2 text-center',
                i === match.currentSet && 'font-bold'
              )}
            >
              {set}
            </td>
          ))}
          {!match.isComplete && (
            <>
              <td className="py-2 text-center font-medium">
                {match.player2.games}
              </td>
              <td className="py-2 text-center font-medium">
                {match.player2.points}
              </td>
            </>
          )}
        </tr>
      </tbody>
    </table>
  )
}
