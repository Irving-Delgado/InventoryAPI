import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  isActive: z.boolean().optional(),
});

export const updateItemSchema = createItemSchema.partial(); // all fields optional for updates

export type CreateItemBody = z.infer<typeof createItemSchema>;