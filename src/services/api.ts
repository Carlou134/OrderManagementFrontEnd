import axios from 'axios'

const ApiUrl = import.meta.env.VITE_API_URL

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface OrderListItem {
  id: number
  orderNumber: string
  orderDate: string
  numberProducts: number
  finalPrice: number
  status: number
}

export interface OrderProductDetail {
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderDetail {
  id: number
  orderNumber: string
  orderDate: string
  status: number
  orderProducts: OrderProductDetail[]
}

export interface CreateOrderPayload {
  OrderNumber: string
  Products: { ProductId: number; Quantity: number }[]
}

export interface Product {
  id: number
  name: string
  unitPrice: number
}

export type ProductPayload = Omit<Product, 'id'>

// Orders

export const getOrders = async (): Promise<OrderListItem[]> => {
  try {
    const response = await axios.get<PagedResult<OrderListItem>>(`${ApiUrl}/orders/list`)
    return response.data.items
  } catch (e) {
    console.error('Error: ', e)
    throw e
  }
}

export const createOrder = async (order: CreateOrderPayload) => {
  try {
    const response = await axios.post(`${ApiUrl}/orders/create`, order)
    return response.data
  } catch (error) {
    console.error('Error: ', error)
    throw error
  }
}

export const updateOrder = async (id: number | string, order: CreateOrderPayload) => {
  try {
    const response = await axios.put(`${ApiUrl}/orders/update/${id}`, order)
    return response.data
  } catch (error) {
    console.error('Error: ', error)
    throw error
  }
}

export const deleteOrder = async (id: number | string) => {
  try {
    const response = await axios.delete(`${ApiUrl}/orders/delete/${id}`)
    return response.data
  } catch (error) {
    console.error('Error: ', error)
    throw error
  }
}

export const listOrderById = async (id: number | string): Promise<OrderDetail> => {
  try {
    const response = await axios.get<OrderDetail>(`${ApiUrl}/orders/list/${id}`)
    return response.data
  } catch (error) {
    console.error('Error: ', error)
    throw error
  }
}

export const ChangeOrderStatus = async (status: number, id: number | string) => {
  return axios.post(
    `${ApiUrl}/orders/changestatus/${id}`,
    { status },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

// Products

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get<PagedResult<Product>>(`${ApiUrl}/products/list`)
    return response.data.items
  } catch (e) {
    console.error('Error: ', e)
    throw e
  }
}

export const createProduct = async (product: ProductPayload) => {
  try {
    const response = await axios.post(`${ApiUrl}/products/create`, product)
    return response.data
  } catch (error) {
    console.error('Error: ', error)
    throw error
  }
}

export const updateProduct = async (id: number | string, product: ProductPayload) => {
  try {
    const response = await axios.put(`${ApiUrl}/products/update/${id}`, product)
    return response.data
  } catch (error) {
    console.error('Error: ', error)
    throw error
  }
}

export const deleteProduct = async (id: number | string) => {
  try {
    const response = await axios.delete(`${ApiUrl}/products/delete/${id}`)
    return response.data
  } catch (error) {
    console.error('Error: ', error)
    throw error
  }
}

export const listProductById = async (id: number | string): Promise<Product> => {
  try {
    const response = await axios.get<Product>(`${ApiUrl}/products/list/${id}`)
    return response.data
  } catch (error) {
    console.error('Error: ', error)
    throw error
  }
}
