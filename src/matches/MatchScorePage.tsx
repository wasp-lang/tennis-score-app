import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Lock } from "lucide-react";
import {
  useQuery,
  useAction,
  getMatch,
  updateScore,
  updateMatchVisibility,
} from "wasp/client/operations";

import { AuthUser } from "wasp/auth";
import { ResultTable } from "./components/ResultTable";
import { CurrentPoints } from "./components/CurrentPoints";
import { FinalScore } from "./components/FinalScore";
import { TennisCourtVisualisation } from "../components/TennisCourt";

export function MatchScorePage({ user }: { user: AuthUser }) {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

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
  );
  const updateScoreFn = useAction(updateScore);
  const updateVisibilityFn = useAction(updateMatchVisibility);

  const handleScore = async (player: 1 | 2) => {
    if (matchId) {
      try {
        await updateScoreFn({ matchId, scoringPlayer: player });
      } catch (error) {
        console.error("Failed to update score:", error);
        alert("Failed to update score.");
      }
    }
  };

  const handleToggleVisibility = async () => {
    if (matchId) {
      try {
        await updateVisibilityFn({
          matchId,
          isPublic: !match!.isPublic,
        });
      } catch (error) {
        console.error("Failed to update visibility:", error);
        alert("Failed to update match visibility.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading match...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">
          {error?.message || "Match not found"}
        </div>
      </div>
    );
  }

  const { player1, player2 } = match;
  const isOwner = match.createdBy === user.id;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-[#1B2838] hover:text-[#2E5A27] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-[#1B2838] ml-4">Live Match</h1>
        </div>

        <TennisCourtVisualisation
          className="h-64 md:h-96"
          player1Name={player1.name}
          player2Name={player2.name}
        />

        <div className="bg-white rounded-lg shadow-xl p-6 relative">
          <div className="flex justify-end items-center mb-4">
            {isOwner && (
              <button
                onClick={handleToggleVisibility}
                className="text-gray-600 hover:text-forest transition-colors flex items-center gap-1 text-sm border px-2 py-1 rounded-full hover:bg-gray-50"
                title={match.isPublic ? "Change to private" : "Make public"}
              >
                {match.isPublic ? (
                  <>
                    <Globe className="w-4 h-4" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Private
                  </>
                )}
              </button>
            )}
          </div>

          {match.isComplete && <FinalScore match={match} />}
          {!match.isComplete && <CurrentPoints match={match} />}

          {/* Score board in tennis style */}
          <div className="border rounded-lg overflow-hidden mb-8">
            <ResultTable match={match} />
          </div>

          {match.isComplete ? (
            <div className="text-center py-4 text-lg font-bold text-[#2E5A27]">
              Match Complete
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleScore(1)}
                className="bg-[#2E5A27] text-white py-4 px-6 rounded-lg hover:bg-[#234420] transition-colors"
              >
                Point for {player1.name}
              </button>
              <button
                onClick={() => handleScore(2)}
                className="bg-[#2E5A27] text-white py-4 px-6 rounded-lg hover:bg-[#234420] transition-colors"
              >
                Point for {player2.name}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
