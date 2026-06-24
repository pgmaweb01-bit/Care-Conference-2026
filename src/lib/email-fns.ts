import { createServerFn } from "@tanstack/react-start";
import { sendEmails as serverSendEmails, type SendEmailInput } from "./server/email";

export const sendCampaign = createServerFn({ method: "POST" })
  .validator((d: unknown) => d as SendEmailInput)
  .handler(async ({ data }) => serverSendEmails(data));
