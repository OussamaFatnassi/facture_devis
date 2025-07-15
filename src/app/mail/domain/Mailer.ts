import { MailMessage } from "../application/types/MailMessage";

export interface Mailer {
  send(mail: MailMessage): Promise<void>;
}
