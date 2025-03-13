import { Match } from "../types";

export function FinalScore({ match }: { match: Match }) {
  if (!match.isComplete) return null;

  const player1SetsWon = match.player1.sets.filter(
    (set, index) => set > (match.player2.sets[index] || 0)
  ).length;

  const player2SetsWon = match.player2.sets.filter(
    (set, index) => set > (match.player1.sets[index] || 0)
  ).length;

  const winner =
    player1SetsWon > player2SetsWon ? match.player1 : match.player2;
  const loser = winner === match.player1 ? match.player2 : match.player1;

  // Calculate winner's and loser's set counts in the correct order
  const winnerSetsWon =
    winner === match.player1 ? player1SetsWon : player2SetsWon;
  const loserSetsWon =
    winner === match.player1 ? player2SetsWon : player1SetsWon;

  const formattedScore = match.player1.sets
    .map(
      (set, index) =>
        `${winner === match.player1 ? set : match.player2.sets[index]}-${
          loser === match.player2 ? match.player2.sets[index] : set
        }`
    )
    .join(", ");

  return (
    <div className="text-center py-6">
      <h2 className="text-3xl font-bold text-forest">
        {winner.name} won {winnerSetsWon}-{loserSetsWon}! 🎉
      </h2>
      <p className="text-xl text-navy mt-2">Score: {formattedScore}</p>
    </div>
  );
}
