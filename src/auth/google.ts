import { defineUserSignupFields } from 'wasp/server/auth'
import { z } from 'zod'

const googleDataSchema = z.object({
  profile: z.object({
    email: z.string(),
    email_verified: z.boolean().optional(),
  }),
})

export const userSignupFields = defineUserSignupFields({
  email: (data) => {
    const googleData = googleDataSchema.parse(data)
    return googleData.profile.email
  },
})

export function getConfig() {
  return {
    scopes: ['email'],
  }
}
