import { type SendEmailSummaryJob } from "wasp/server/jobs";
import { emailSender } from "wasp/server/email";
import { generateMatchSummary } from "../utils";

export const sendEmailSummary: SendEmailSummaryJob<{}, void> = async (_, context) => {
  // Find yesterday's completed matches
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const matches = await context.entities.Match.findMany({
    where: {
      createdAt: {
        gte: yesterday,
        lt: today,
      },
      isComplete: true
    },
    include: {
      sets: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Generate summary
  const { textContent, htmlContent } = generateMatchSummary(matches);

  // Email Summary
  const summary = await emailSender.send({
    from: {
      name: "Tennis Score App",
      email: "notifications@tennisscoreapp.com",
    },
    to: "user@domain.com",
    subject: "Daily Tennis Matches Summary",
    text: textContent,
    html: htmlContent,
  });
}
