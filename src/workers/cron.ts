import { startOfDay, subDays } from 'date-fns'
import { emailSender } from 'wasp/server/email'
import type { SendEmailSummaryJob } from 'wasp/server/jobs'
import { generateMatchSummary } from '../utils'

// biome-ignore lint/complexity/noBannedTypes: This is how Wasp defines their types ({} was recommended by maintainer)
export const sendEmailSummary: SendEmailSummaryJob<{}, void> = async (
  _,
  context
) => {
  // Fetch all users with email summaries enabled
  const usersWithSummaryEnabled = await context.entities.User.findMany({
    where: {
      isSummaryEnabled: true,
      email: {
        not: null,
      },
    },
    select: {
      id: true,
      email: true,
    },
  })

  if (usersWithSummaryEnabled.length === 0) {
    console.log('No users have email summaries enabled')
    return
  }

  // Find yesterday's completed matches
  const today = startOfDay(new Date())
  const yesterday = startOfDay(subDays(today, 1))

  const matches = await context.entities.Match.findMany({
    where: {
      createdAt: {
        gte: yesterday,
        lt: today,
      },
      isComplete: true,
    },
    include: {
      sets: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Generate summary
  const { textContent, htmlContent } = generateMatchSummary(matches)

  // Send emails to all users with summaries enabled
  for (const user of usersWithSummaryEnabled) {
    try {
      await emailSender.send({
        from: {
          name: 'Tennis Score App',
          email: `no-reply@${process.env.MAILGUN_DOMAIN}`,
        },
        to: user.email as string,
        subject: 'Daily Tennis Matches Summary',
        text: textContent,
        html: htmlContent,
      })
      console.log(`Email summary sent to user ${user.id} (${user.email})`)
    } catch (error) {
      console.error(
        `Failed to send email to user ${user.id} (${user.email}):`,
        error
      )
    }
  }

  console.log(`Email summaries sent to ${usersWithSummaryEnabled.length} users`)
}
