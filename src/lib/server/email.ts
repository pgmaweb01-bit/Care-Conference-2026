export type SendEmailInput = {
  to: { name: string; email: string }[];
  subject: string;
  body: string;
  html?: string;
};

export async function sendEmails(input: SendEmailInput): Promise<{ sent: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const maskedFrom = emailFrom ? emailFrom.replace(/(.{3}).*(@.*)/, "$1***$2") : "NOT SET";
  console.log(`[email] RESEND_API_KEY present: ${!!apiKey}, EMAIL_FROM: ${maskedFrom}`);

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — emails logged to console instead");
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

  const fromRaw = emailFrom ?? "";
  const from =
    /<[^@]+@[^>]+>$/.test(fromRaw) ? fromRaw :
    fromRaw.includes("@") ? `Care Conference <${fromRaw}>` :
    "Care Conference <noreply@careconference-2026.purpleglobalmission.org>";

  const body: Record<string, unknown> = {
    from,
    to: input.to.map((r) => r.email),
    subject: input.subject,
    text: input.body,
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@careconference-2026.purpleglobalmission.org>, <https://careconference-2026.purpleglobalmission.org/unsubscribe>",
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
  if (input.html) body.html = input.html;

  console.log(`[email] Posting to Resend, to=${input.to.map(r=>r.email).join(",")}, subject=${input.subject}`);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[email] Resend API error: ${res.status} ${err}`);
    throw new Error(`Resend API error: ${res.status} ${err}`);
  }

  const json = await res.json();
  console.log(`[email] Resend response:`, json);
  return { sent: input.to.length };
}
