export interface CreateUserDto {
  email: string;
  password: string;
}

export interface UpdateUserDto extends CreateUserDto {
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
}