import { Mailer } from "../../domain/Mailer";
import { MailMessage } from "../types/MailMessage";

export class MailService {
  constructor(private mailer: Mailer) {}

  async sendSimpleMessage(to: string, subject: string, html: string) {
    const message: MailMessage = { to, subject, html };
    await this.mailer.send(message);
  }

  async sendQuotationConfirmation(
    to: string,
    quotationId: string,
    senderFullname: string
  ) {
    const subject = "Confirmation de réception de votre devis";
    const html = `
      <p>Bonjour,</p></br>
      <p>Votre devis a bien été enregistré.</p></br>
      <p>Vous pouvez le consulter ici : 
         <a href="http://localhost:3000/api/quotations/${quotationId}/download">Voir le devis</a></p></br>
      <p>Cordialement,</p>
      <p>${senderFullname}.</p>
    `;
    console.log(`${process.env.APP_URL}/quotations/${quotationId}/download`);
    await this.mailer.send({ to, subject, html });
  }
}
