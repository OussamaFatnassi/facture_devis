import { ClientInfo } from "./Quotation";

export interface CreateClientRequest {
  firstname: string;
  lastname: string;
  activityName: string;
  address: string;
  phone: string;
  email: string;
  legalStatus: string;
}

export interface ClientRepository {
  findById(id: string): Promise<ClientInfo | null>;
  findAll(): Promise<ClientInfo[]>;
  findByUser(userId: string): Promise<ClientInfo[]>;
  create(client: CreateClientRequest, userId: string): Promise<ClientInfo>;
}
