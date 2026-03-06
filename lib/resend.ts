import { Resend } from 'resend'

export async function sendPlanEmail({
  to,
  shopperName,
  shareUrl,
  retailerName,
  fromEmail,
}: {
  to: string
  shopperName: string
  shareUrl: string
  retailerName: string
  fromEmail: string
}) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  return resend.emails.send({
    from: fromEmail,
    to,
    subject: `Your ${retailerName} Room Plan is Ready`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Room Plan</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #1a1a2e; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">${retailerName}</h1>
      <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Your personalized room plan</p>
    </div>
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Hi ${shopperName}, your room plan is ready! Click below to view your personalized furniture selections and room layout.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${shareUrl}" style="background: #e94560; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          View Your Room Plan
        </a>
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 24px 0 0; border-top: 1px solid #e5e7eb; padding-top: 24px;">
        You can use this link to revisit your plan anytime. Visit us in-store to see the pieces in person.
      </p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  })
}
