export interface CurrentUser {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CurrentUserService {
  getCurrentUser(): Promise<CurrentUser>;
}
