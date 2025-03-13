import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAction, createMatch } from "wasp/client/operations";
import { AuthUser } from "wasp/auth";

export function NewMatchPage({ user }: { user: AuthUser }) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const createMatchFn = useAction(createMatch);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1.trim() || !player2.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const match = await createMatchFn({
        player1Name: player1.trim(),
        player2Name: player2.trim(),
      });
      navigate(`/match/${match.id}`);
    } catch (error) {
      console.error("Failed to create match:", error);
      alert("Failed to create match. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-navy ml-3">New Match</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="player1"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Player 1
            </label>
            <input
              type="text"
              id="player1"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-transparent"
              placeholder="Enter player name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="player2"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Player 2
            </label>
            <input
              type="text"
              id="player2"
              value={player2}
              onChange={(e) => setPlayer2(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-transparent"
              placeholder="Enter player name"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-forest text-white py-3 rounded-md hover:bg-[#234420] transition-colors duration-200 font-medium"
          >
            {isSubmitting ? "Creating..." : "Start Match"}
          </button>
        </form>
      </div>
    </div>
  );
}
