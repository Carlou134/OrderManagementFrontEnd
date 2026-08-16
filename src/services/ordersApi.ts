import axios from 'axios'
import type { PagedResult } from '@/types/pagination'
import type { Order, OrderQueryParams, CreateOrderPayload } from '@/types/order'

const ApiUrl = import.meta.env.VITE_API_URL

export const getOrders = async (params: OrderQueryParams = {}): Promise<PagedResult<Order>> => {
  try {
    const response = await axios.get<PagedResult<Order>>(`${ApiUrl}/orders/list`, { params })
    return response.data
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

export const listOrderById = async (id: number | string): Promise<Order> => {
  try {
    const response = await axios.get<Order>(`${ApiUrl}/orders/list/${id}`)
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
