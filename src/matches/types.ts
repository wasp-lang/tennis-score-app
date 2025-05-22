import { getMatches } from 'wasp/client/operations'

export type Match = Awaited<ReturnType<typeof getMatches>>[number]
