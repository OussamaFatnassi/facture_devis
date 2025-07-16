import { Mailer } from "../domain/Mailer";
import { MailMessage } from "../application/types/MailMessage";
import nodemailer from "nodemailer";

export class NodemailerMailer implements Mailer {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  async send(mail: MailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: mail.from || `"Support" <${process.env.SMTP_USER!}>`,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
    });
  }
}
