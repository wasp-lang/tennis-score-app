import { defineUserSignupFields } from 'wasp/server/auth'

export const userSignupFields = defineUserSignupFields({
  email: (data: any) => data.profile.email,
})

export function getConfig() {
  return {
    scopes: ['email'],
  }
}