import { z } from 'zod'

export const orderProductFormSchema = z.object({
  productId: z.number().int().positive('Select a product'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
})

export type OrderProductFormValues = z.infer<typeof orderProductFormSchema>
