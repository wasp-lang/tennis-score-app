import * as z from 'zod'

export const updateUserSummaryEnabledSchema = z.object({
  isSummaryEnabled: z.boolean(),
})
