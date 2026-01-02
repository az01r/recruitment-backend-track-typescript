export interface CreateTaxProfileDTO {
  legalName: string;
  vatNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  userId: string;
}

export interface ReadTaxProfileOptionsDto {
  userId: string;
  legalName?: string;
  vatNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  gteCreatedAt?: string;
  lteCreatedAt?: string;
  gteUpdatedAt?: string;
  lteUpdatedAt?: string;
  skip?: number;
  take?: number;
}

export interface ReadUniqueTaxProfileDto {
  id: string;
  userId: string;
}


export interface UpdateTaxProfileDto extends ReadUniqueTaxProfileDto {
  legalName?: string;
  vatNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
}

export interface TaxProfileResponseDTO {
  id: string;
  userId: string;
  legalName: string;
  vatNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}