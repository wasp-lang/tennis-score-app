import * as z from "zod";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAction, createMatch } from "wasp/client/operations";
import { AuthUser } from "wasp/auth";

import { useForm } from "react-hook-form";
import { createMatchInputSchema } from "./validation";
import { zodResolver } from "@hookform/resolvers/zod";

type CreateMatchForm = z.infer<typeof createMatchInputSchema>;

export function NewMatchPage({ user }: { user: AuthUser }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateMatchForm>({
    resolver: zodResolver(createMatchInputSchema),
  });
  const navigate = useNavigate();
  const createMatchFn = useAction(createMatch);

  const onSubmit = async (data: CreateMatchForm) => {
    try {
      const match = await createMatchFn({
        player1Name: data.player1Name,
        player2Name: data.player2Name,
      });
      navigate(`/match/${match.id}`);
    } catch (error) {
      console.error("Failed to create match:", error);
      alert("Failed to create match. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-3xl font-bold text-navy ml-3">New Match</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="player1"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Player 1
            </label>
            <input
              {...register("player1Name")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-transparent"
              placeholder="Enter player name"
            />
            {errors.player1Name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.player1Name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="player2"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Player 2
            </label>
            <input
              {...register("player2Name")}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-forest focus:border-transparent"
              placeholder="Enter player name"
            />
            {errors.player2Name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.player2Name.message}
              </p>
            )}
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
