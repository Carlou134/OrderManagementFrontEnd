import { z } from 'zod'

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  unitPrice: z.number().positive('Unit price must be greater than 0'),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
