export type SendEmailInput = {
  to: { name: string; email: string }[];
  subject: string;
  body: string;
};

export async function sendEmails(input: SendEmailInput): Promise<{ sent: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — emails logged to console instead");
    for (const recipient of input.to) {
      const personalised = input.body
        .replace(/\{\{name\}\}/g, recipient.name)
        .replace(/\{\{id\}\}/g, "");
      console.log(`[EMAIL] To: ${recipient.email} (${recipient.name})`);
      console.log(`[EMAIL] Subject: ${input.subject}`);
      console.log(`[EMAIL] Body: ${personalised}`);
    }
    return { sent: input.to.length };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Care Conference <noreply@careconference.ng>",
      to: input.to.map((r) => r.email),
      subject: input.subject,
      text: input.body,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error: ${res.status} ${err}`);
  }

  return { sent: input.to.length };
}
