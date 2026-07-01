import { Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

function redisConnection() {
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null as unknown as number,
  };
}

interface EmailJob {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const emailWorker = new Worker<EmailJob>(
  'email',
  async (job: Job<EmailJob>) => {
    const { to, subject, html, text } = job.data;

    await transporter.sendMail({
      from: `"LAKAY" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log(`[EmailWorker] Email sent to ${to} — subject: ${subject}`);
  },
  {
    connection: redisConnection(),
    concurrency: 5,
    limiter: { max: 100, duration: 60000 },
  }
);

emailWorker.on('failed', (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
});
