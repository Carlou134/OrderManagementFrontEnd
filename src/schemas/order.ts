import { z } from 'zod'

export const orderProductLineSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  unitPrice: z.number(),
  quantity: z.number().int().positive(),
  totalPrice: z.number(),
})

export const orderFormSchema = z.object({
  orderNumber: z.string().min(1),
  orderDate: z.string().min(1),
  orderProducts: z.array(orderProductLineSchema).min(1, 'You must add at least one product'),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>
