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
    clientFirstName: string,
    senderFullname: string,
    invoice?: boolean
  ) {
    const subject = `Confirmation de réception de votre ${
      invoice === true ? "facture" : "devis"
    }`;
    const html = `
      <p>Bonjour ${clientFirstName},</p></br>
      <p>Votre ${invoice === true ? "facture" : "devis"} a bien été enregistré${
      invoice === true ? "e" : ""
    }.</p></br>
      <p>Vous pouvez ${invoice === true ? "la" : "le"} consulter ici : 
         <a href="http://localhost:3000/${
           invoice === true ? "invoice" : "quotation"
         }/api/${quotationId}/download">Voir ${
      invoice === true ? "la" : "le"
    } ${invoice === true ? "facture" : "devis"}</a></p></br>
      <p>Cordialement,</p>
      <p>${senderFullname}.</p>
    `;
    await this.mailer.send({ to, subject, html });
  }
}
