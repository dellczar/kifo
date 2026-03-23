import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)
export const FROM = process.env.RESEND_FROM_EMAIL || 'hello@kifo.com'

export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to Kifo',
    html: `
      <h2>Welcome to Kifo, ${name || 'friend'}.</h2>
      <p>Your account is ready. Create your first memorial — it only takes a few minutes.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/wizard">Create a memorial →</a>
    `,
  })
}

export async function sendAnniversaryReminder(opts: {
  email: string
  name: string
  memorialName: string
  memorialSlug: string
  reminderType: 'birthday' | 'anniversary'
}) {
  const subject = opts.reminderType === 'birthday'
    ? `It's ${opts.memorialName}'s birthday`
    : `Remembering ${opts.memorialName}`

  return resend.emails.send({
    from: FROM,
    to: opts.email,
    subject,
    html: `
      <p>Hi ${opts.name},</p>
      <p>Today is ${opts.reminderType === 'birthday' ? `${opts.memorialName}'s birthday` : `the anniversary of ${opts.memorialName}'s passing`}.</p>
      <p>Visit the memorial to light a candle or leave a tribute.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/memorial/${opts.memorialSlug}">Visit memorial →</a>
      <hr>
      <small><a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">Manage reminder settings</a></small>
    `,
  })
}

export async function sendTributeNotification(opts: {
  email: string
  ownerName: string
  memorialName: string
  memorialSlug: string
  authorName: string
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.email,
    subject: `${opts.authorName} left a tribute for ${opts.memorialName}`,
    html: `
      <p>Hi ${opts.ownerName},</p>
      <p>${opts.authorName} just left a tribute on ${opts.memorialName}'s memorial.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/memorial/${opts.memorialSlug}#tributes">View tribute →</a>
    `,
  })
}
