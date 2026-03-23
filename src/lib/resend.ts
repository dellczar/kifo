import { Resend } from "resend"
export const resend = new Resend(process.env.RESEND_API_KEY)
export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({ from: process.env.RESEND_FROM_EMAIL!, to: email, subject: "Welcome to Kifo", html: `<p>Hi ${name}, welcome to Kifo!</p>` })
}
export async function sendAnniversaryReminder(opts: { email: string; name: string; memorialName: string; memorialSlug: string; reminderType: "birthday" | "anniversary" }) {
  return resend.emails.send({ from: process.env.RESEND_FROM_EMAIL!, to: opts.email, subject: `Remembering ${opts.memorialName}`, html: `<p>Hi ${opts.name}, today is a special day to remember ${opts.memorialName}.</p>` })
}
