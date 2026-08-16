import axios from 'axios'
import type { PagedResult } from '@/types/pagination'
import type { Product, ProductQueryParams, ProductPayload } from '@/types/product'

const ApiUrl = import.meta.env.VITE_API_URL

export const getProducts = async (
  params: ProductQueryParams = {}
): Promise<PagedResult<Product>> => {
  try {
    const response = await axios.get<PagedResult<Product>>(`${ApiUrl}/products/list`, { params })
    return response.data
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
