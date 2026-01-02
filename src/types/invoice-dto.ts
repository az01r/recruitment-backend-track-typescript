export type CurrencyDto = "EUR" | "USD" | "GBP";

export type InvoiceStatusDto = "PENDING" | "PAID" | "CANCELLED";

export interface CreateInvoiceDto {
  userId: string;
  status: InvoiceStatusDto;
  amount: number;
  currency: CurrencyDto;
  taxProfileId: string;
};

export interface ReadInvoiceOptionsDto {
  userId: string;
  taxProfileId?: string;
  amount?: number;
  status?: InvoiceStatusDto;
  currency?: CurrencyDto;
  gteCreatedAt?: string;
  lteCreatedAt?: string;
  gteUpdatedAt?: string;
  lteUpdatedAt?: string;
  skip?: number;
  take?: number;
};

export interface ReadUniqueInvoiceDto {
  id: string;
  userId: string;
}

export interface UpdateInvoiceDto extends ReadUniqueInvoiceDto {
  amount?: number;
  status?: InvoiceStatusDto;
  currency?: CurrencyDto;
};



export interface ResponseInvoiceDTO {
  id: string;
  taxProfileId: string;
  amount: number;
  status: InvoiceStatusDto;
  currency: CurrencyDto;
  createdAt: string;
  updatedAt: string;
}
