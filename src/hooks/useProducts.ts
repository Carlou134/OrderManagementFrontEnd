import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/services/productsApi'
import type { ProductPayload, ProductQueryParams } from '@/types/product'

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product: ProductPayload) => createProduct(product),
    onSuccess: () => {
      toast.success('Product created successfully')
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error) => {
      console.error('Error creating product:', error)
      toast.error('Could not create product')
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...product }: ProductPayload & { id: number }) =>
      updateProduct(id, product),
    onSuccess: () => {
      toast.success('Product updated successfully')
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error) => {
      console.error('Error updating product:', error)
      toast.error('Could not update product')
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (error) => {
      console.error('Error deleting product:', error)
      toast.error('Could not delete product')
    },
  })
}
