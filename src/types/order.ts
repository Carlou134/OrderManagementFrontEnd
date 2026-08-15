export interface OrderProductDetail {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
}

// Mirrors the backend's OrderDto exactly — the API returns this same shape for
// both the paginated list and the single-order lookup, so the frontend keeps
// one type instead of two artificial subsets of it.
export interface Order {
  id: number
  orderNumber: string
  orderDate: string
  status: number
  finalPrice: number
  numberProducts: number
  orderProducts: OrderProductDetail[] | null
}

export interface OrderQueryParams {
  page?: number
  pageSize?: number
  status?: number
}

export interface CreateOrderPayload {
  OrderNumber: string
  Products: { ProductId: number; Quantity: number }[]
}
