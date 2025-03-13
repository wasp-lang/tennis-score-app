import { Match } from "../types";
import { TennisBall } from "../../icons/TennisBall";
import { cn } from "../../tailwind";

export function CurrentPoints({ match }: { match: Match }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="text-center">
        <div
          className={cn(
            "font-medium text-navy flex items-center justify-center",
            !match.isComplete && match.server === 1 && "text-forest font-bold"
          )}
        >
          {!match.isComplete && match.server === 1 && (
            <TennisBall className="w-4 h-4 mr-1 text-yellow-400" />
          )}
          {match.player1.name}
        </div>
        <div className="text-2xl font-bold text-forest">
          {match.player1.points}
        </div>
      </div>
      <div className="text-center flex items-center justify-center">
        <div className="text-sm text-gray-500">Current game</div>
      </div>
      <div className="text-center">
        <div
          className={cn(
            "font-medium text-navy flex items-center justify-center",
            !match.isComplete && match.server === 2 && "text-forest font-bold"
          )}
        >
          {match.player2.name}
          {!match.isComplete && match.server === 2 && (
            <TennisBall className="w-4 h-4 ml-1 text-yellow-400" />
          )}
        </div>
        <div className="text-2xl font-bold text-forest">
          {match.player2.points}
        </div>
      </div>
    </div>
  );
}
