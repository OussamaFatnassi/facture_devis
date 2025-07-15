import { ClientInfo } from "./Quotation";

export interface ClientRepository {
  findById(id: string): Promise<ClientInfo | null>;
}
