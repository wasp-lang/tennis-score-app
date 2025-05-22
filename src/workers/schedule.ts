import { startOfDay, subDays } from 'date-fns'
import { emailSender } from 'wasp/server/email'
import { type SendEmailSummaryJob } from 'wasp/server/jobs'
import { generateMatchSummary, isValidEmail } from '../utils'

export const sendEmailSummary: SendEmailSummaryJob<{}, void> = async (
  _,
  context
) => {
  const email = process.env.SUMMARY_RECIPIENT_EMAIL

  if (!email) {
    throw new Error(
      'Recipient email not found. Please set SUMMARY_RECIPIENT_EMAIL in .env.server'
    )
  }

  if (!isValidEmail(email)) {
    throw new Error(
      'Invalid email format. Please provide a valid email in SUMMARY_RECIPIENT_EMAIL'
    )
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

  // Send Summary
  await emailSender.send({
    from: {
      name: 'Tennis Score App',
      email: `no-reply@${process.env.MAILGUN_DOMAIN}`,
    },
    to: email,
    subject: 'Daily Tennis Matches Summary',
    text: textContent,
    html: htmlContent,
  })
}
