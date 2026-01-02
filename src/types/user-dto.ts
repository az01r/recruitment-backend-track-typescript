export interface CreateUserDTO {
  email: string;
  password: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  id: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
}

export interface AuthResponse {
  jwt: string;
  message: string;
}

export interface ResponseUserDTO {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  birthDate: string | null;
  createdAt: string;
  updatedAt: string;
}

