export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};
