import { prisma } from "../../lib/prisma";
import { CreateItemBody } from "./items.model";

export const itemRepository = {
    create(data: CreateItemBody) {
        return prisma.item.create({
            data: {
                ...data,
                sold: 0,
                price: data.price ?? 0,
                quantity: data.quantity ?? 0
            },
        }); 
    },
    list(page: number, limit: number, filters: { name?: string; isActive?: boolean }) {
        return prisma.item.findMany({
            take: limit,
            skip: (page - 1) * limit,
            orderBy: { createdAt: "desc" },
            where: {
                ...(filters.name && { name: { contains: filters.name, mode: "insensitive" } }),
                ...(filters.isActive !== undefined && { isActive: filters.isActive }),
            }
        });
    },
    getById(id: string) {
        return prisma.item.findUnique({ where: { id } });
    },
    update(id: string, data: Partial<CreateItemBody>) {
        return prisma.item.update({ where: { id }, data });
    },
    delete(id: string) {
        return prisma.item.delete({ where: { id } });
    },
    sellMany(id: string, quantity: number) {
        return prisma.item.updateMany({
            where: { 
                id,
                quantity: { gte: quantity }
             },
            data: {
                sold: { increment: quantity },
                quantity: { decrement: quantity }
            }
        });
    }
}