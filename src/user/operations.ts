import { HttpError } from 'wasp/server'
import type { UpdateUserSummaryEnabled } from 'wasp/server/operations'
import * as z from 'zod'
import { updateUserSummaryEnabledSchema } from './validation'

export const updateUserSummaryEnabled = (async (rawArgs, context) => {
  if (!context.user) {
    throw new HttpError(401, 'You must be logged in')
  }

  const { isSummaryEnabled } = updateUserSummaryEnabledSchema.parse(rawArgs)

  try {
    await context.entities.User.update({
      where: { id: context.user.id },
      data: {
        isSummaryEnabled,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HttpError(400, 'Invalid parameters')
    }
    console.error('Error updating user summary settings:', error)
    throw new HttpError(500, 'Error updating user summary settings')
  }
}) satisfies UpdateUserSummaryEnabled<{ isSummaryEnabled: boolean }>
