import { sendEmails } from "./email";
import type { AttendeeRecord } from "./db";

export async function sendConfirmationEmail(record: AttendeeRecord) {
  const data = record.data as Record<string, unknown>;
  const fullName = String(data.fullName ?? "Attendee");
  const email = String(data.email ?? "").trim();
  if (!email) {
    console.warn("[email] No email address in record data, skipping");
    return { sent: 0 };
  }

  const qrUrl = `https://careconference-2026.purpleglobalmission.org/api/qr/${encodeURIComponent(record.id)}`;

  const category = record.type === "speaker" ? "Speaker" : "Attendee";
  const org = String(data.organization ?? data.position ?? "");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:'Segoe UI',system-ui,-apple-system,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.06)">
          <tr>
            <td style="background:linear-gradient(135deg,#1e1b4b,#2d2a6e,#b8860b);padding:32px 40px;text-align:center">
              <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.15);line-height:48px;font-size:22px;font-weight:800;color:#ffffff;margin-bottom:8px">C</div>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">Care Conference 2026</h1>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:1.5px;text-transform:uppercase">Nigeria &middot; Care as Infrastructure</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 24px">
              <p style="margin:0 0 4px;font-size:12px;color:#8b8fa7;text-transform:uppercase;letter-spacing:1px;font-weight:600">Registration confirmed</p>
              <h2 style="margin:0;font-size:26px;font-weight:800;color:#1e1b4b;letter-spacing:-0.5px">Welcome, ${fullName}!</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 8px">
              <table role="presentation" width="100%" cellpadding="12" cellspacing="0" style="background:#f8f7ff;border-radius:14px">
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(30,27,75,0.06)">
                    <div style="font-size:11px;color:#8b8fa7;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Registration ID</div>
                    <div style="font-size:15px;font-weight:700;color:#1e1b4b;font-family:monospace;margin-top:2px">${record.id}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(30,27,75,0.06)">
                    <div style="font-size:11px;color:#8b8fa7;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Category</div>
                    <div style="font-size:15px;font-weight:600;color:#1e1b4b;margin-top:2px">${category}</div>
                  </td>
                </tr>
                ${org ? `<tr>
                  <td style="padding:12px 16px;border-bottom:1px solid rgba(30,27,75,0.06)">
                    <div style="font-size:11px;color:#8b8fa7;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Organisation</div>
                    <div style="font-size:15px;font-weight:600;color:#1e1b4b;margin-top:2px">${org}</div>
                  </td>
                </tr>` : ""}
                <tr>
                  <td style="padding:12px 16px">
                    <div style="font-size:11px;color:#8b8fa7;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Email</div>
                    <div style="font-size:15px;font-weight:600;color:#1e1b4b;margin-top:2px">${email}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;border-radius:16px">
                <tr>
                  <td align="center" style="padding:24px">
                    <img src="${qrUrl}" alt="QR Code" width="160" height="160" style="display:block;border-radius:12px;background:#ffffff;padding:8px" />
                    <p style="margin:12px 0 0;font-size:11px;color:#8b8fa7">Registration ID: <strong>${record.id}</strong></p>
                    <p style="margin:4px 0 0;font-size:11px;color:#8b8fa7">Present this QR code at the venue for check-in</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 28px">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#4a4d5e">
                Thank you for registering for <strong style="color:#1e1b4b">Care Conference 2026</strong> &mdash; <em>Care as Infrastructure: Designing Nigeria&rsquo;s Next Decade of Homecare</em>. We look forward to welcoming you.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f5f6fa;padding:20px 40px;text-align:center">
              <p style="margin:0;font-size:11px;color:#8b8fa7">
                <strong style="color:#4a4d5e">Care Conference 2026</strong><br />
                Abuja, Nigeria &middot; ${new Date().getFullYear()}
              </p>
              <p style="margin:8px 0 0;font-size:10px;color:#b0b3c7">
                Purple Global Mission, Abuja, Nigeria<br />
                <a href="https://careconference-2026.purpleglobalmission.org/unsubscribe" style="color:#8b8fa7;text-decoration:underline">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Registration Confirmed — Care Conference 2026

Dear ${fullName},

Thank you for registering for Care Conference 2026.

Your Registration ID: ${record.id}
Category: ${category}
${org ? `Organisation: ${org}` : ""}

Please save your Registration ID and present the QR code at the venue for check-in.

We look forward to welcoming you.

— Care Conference Team

--
Care Conference 2026 | Purple Global Mission, Abuja, Nigeria
Unsubscribe: https://careconference-2026.purpleglobalmission.org/unsubscribe`;

  return sendEmails({
    to: [{ name: fullName, email }],
    subject: `Registration Confirmed — ${record.id} — Care Conference 2026`,
    body: text,
    html,
  });
}
