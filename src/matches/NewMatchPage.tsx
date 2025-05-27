import { useNavigate } from 'react-router-dom'
import type { AuthUser } from 'wasp/auth'
import { createMatch, useAction } from 'wasp/client/operations'
import type { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createMatchInputSchema } from './validation'

type CreateMatchForm = z.infer<typeof createMatchInputSchema>

export function NewMatchPage({ user }: { user: AuthUser }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateMatchForm>({
    resolver: zodResolver(createMatchInputSchema),
  })
  const navigate = useNavigate()
  const createMatchFn = useAction(createMatch)

  const onSubmit = async (data: CreateMatchForm) => {
    try {
      const match = await createMatchFn(data)
      navigate(`/match/${match.id}`)
    } catch (error) {
      console.error('Failed to create match:', error)
      alert('Failed to create match. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center justify-center">
          <h1 className="ml-3 text-3xl font-bold text-navy">New Match</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="player1"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Player 1
            </label>
            <input
              {...register('player1Name')}
              type="text"
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-forest"
              placeholder="Enter player name"
            />
            {errors.player1Name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.player1Name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="player2"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Player 2
            </label>
            <input
              {...register('player2Name')}
              type="text"
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-forest"
              placeholder="Enter player name"
            />
            {errors.player2Name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.player2Name.message}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('isPublic')}
              type="checkbox"
              id="isPublic"
              className="h-4 w-4 rounded border-gray-300 text-forest focus:ring-forest"
            />
            <label
              htmlFor="isPublic"
              className="ml-2 block text-sm text-gray-700"
            >
              Make this match public
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-forest py-3 font-medium text-white transition-colors duration-200 hover:bg-[#234420]"
          >
            {isSubmitting ? 'Creating...' : 'Start Match'}
          </button>
        </form>
      </div>
    </div>
  )
}
