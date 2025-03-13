import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useQuery, getMatches } from "wasp/client/operations";
import { ResultTable } from "./components/ResultTable";
import { CurrentPoints } from "./components/CurrentPoints";
import { FinalScore } from "./components/FinalScore";
import { cn } from "../tailwind";
import type { Match } from "./types";
import { logout, useAuth } from "wasp/client/auth";
import { Link } from "wasp/client/router";
import { AuthUser } from "wasp/auth";

export function IndexPage() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const { data: matches, isLoading } = useQuery(
    getMatches,
    {},
    {
      refetchInterval: 5000,
    }
  );

  // Split matches into live and completed
  const liveMatches = matches?.filter((match) => !match.isComplete) || [];
  const completedMatches = matches?.filter((match) => match.isComplete) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-navy">Tennis Matches</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <Link
              to="/new"
              className="flex items-center bg-forest text-white px-4 py-2 rounded-md hover:bg-[#234420] transition-colors no-underline"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Match
            </Link>
            <button
              onClick={logout}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
        {!user && (
          <Link
            to="/login"
            className="flex items-center bg-forest text-white px-4 py-2 rounded-md hover:bg-[#234420] transition-colors no-underline"
          >
            Login
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          Loading matches...
        </div>
      ) : !matches || matches.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          No matches found. Start a new match to begin scoring.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Live Matches Section */}
          <div>
            <h2 className="text-xl font-semibold text-navy mb-4 flex items-center">
              <span className="h-2 w-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              Live Matches
            </h2>
            <div className="space-y-4">
              {liveMatches.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
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
            <h2 className="text-xl font-semibold text-navy mb-4">
              Completed Matches
            </h2>
            <div className="space-y-4">
              {completedMatches.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
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
  );
}

function MatchCard({
  match,
  isClickable,
  onClick,
  user,
}: {
  match: Match;
  isClickable: boolean;
  onClick?: () => void;
  user?: AuthUser | null;
}) {
  const isUserMatch = user && user.id === match.createdBy;

  return (
    <div
      key={match.id}
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "bg-white rounded-lg shadow-md p-6",
        isClickable && "cursor-pointer hover:shadow-lg transition-shadow"
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Started at {formatTime(match.createdAt)}
        </div>
        <div className="flex gap-2">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm flex items-center",
              match.isComplete
                ? "bg-gray-100 text-gray-600"
                : "bg-green-100 text-green-600"
            )}
          >
            {match.isComplete ? (
              "Completed"
            ) : (
              <>
                <span className="h-2 w-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                Live
              </>
            )}
          </div>
          {isUserMatch && (
            <div className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
              Your match
            </div>
          )}
        </div>
      </div>

      {match.isComplete && <FinalScore match={match} />}
      {!match.isComplete && <CurrentPoints match={match} />}

      <div className="border rounded-lg overflow-hidden">
        <ResultTable match={match} />
      </div>
    </div>
  );
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
