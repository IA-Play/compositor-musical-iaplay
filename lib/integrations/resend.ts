import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTransactionalEmail(to: string, subject: string, html: string) {
  return resend.emails.send({
    from: "NoAlvo <notificacoes@canalnoalvo.com>",
    to,
    subject,
    html
  });
}
