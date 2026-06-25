export type SendEmailInput = {
  to: { name: string; email: string }[];
  subject: string;
  body: string;
  html?: string;
};

function personalize(text: string, name: string, id: string, email: string) {
  return text
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{id\}\}/g, id)
    .replace(/\{\{email\}\}/g, email);
}

function buildDefaultHtml(body: string, name: string, id: string) {
  const content = personalize(body, name, id, "").replace(/\n/g, "<br>");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">
<tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
<span style="display:inline-block;background:rgba(212,175,55,0.15);border-radius:20px;padding:4px 12px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d4af37;">Care Conference 2026</span>
<h1 style="margin:16px 0 0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-.5px;"><span style="color:#fff;">CARE</span><br><span style="color:#d4af37;">CONFERENCE</span></h1>
</td></tr>
<tr><td style="background:#fff;padding:40px;border-radius:0 0 16px 16px;box-shadow:0 4px 12px rgba(0,0,0,.05);">
<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#333;">${content}</p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
<p style="margin:0;font-size:12px;line-height:1.6;color:#999;">Care Conference 2026 · Abuja, Nigeria</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendEmails(input: SendEmailInput): Promise<{ sent: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!apiKey) {
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

  let sent = 0;
  for (const recipient of input.to) {
    const html = input.html
      ? personalize(input.html, recipient.name, "", recipient.email)
      : buildDefaultHtml(input.body, recipient.name, "");
    const text = personalize(input.body, recipient.name, "", recipient.email);
    const subject = personalize(input.subject, recipient.name, "", recipient.email);

    const body: Record<string, unknown> = {
      from,
      to: recipient.email,
      subject,
      text,
      html,
      headers: {
        "List-Unsubscribe": "<mailto:unsubscribe@careconference-2026.purpleglobalmission.org>, <https://careconference-2026.purpleglobalmission.org/unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };

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
      console.error(`[email] Resend error for ${recipient.email}: ${res.status} ${err}`);
      continue;
    }

    sent++;
  }

  return { sent };
}
