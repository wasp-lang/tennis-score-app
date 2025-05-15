import { subDays, startOfDay } from 'date-fns';
import { type SendEmailSummaryJob } from "wasp/server/jobs";
import { emailSender } from "wasp/server/email";
import { generateMatchSummary } from "../utils";

type Input = {
  email: string;
}

export const sendEmailSummary: SendEmailSummaryJob<Input, void> = async ({ email }, context) => {
  // Find yesterday's completed matches
  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));

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

  // Send Summary
  const summary = await emailSender.send({
    from: {
      name: "Tennis Score App",
      email: `no-reply@${process.env.MAILGUN_DOMAIN}`,
    },
    to: email,
    subject: "Daily Tennis Matches Summary",
    text: textContent,
    html: htmlContent,
  });
}
