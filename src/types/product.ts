export interface Product {
  id: number
  name: string
  unitPrice: number
}

export interface ProductQueryParams {
  page?: number
  pageSize?: number
  name?: string
}

export type ProductPayload = Omit<Product, 'id'>
