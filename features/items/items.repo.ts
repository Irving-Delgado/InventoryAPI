import { get } from "node:http";
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
    list() {
        return prisma.item.findMany({orderBy: { createdAt: "desc" }});
    },
    getById(id: string) {
        return prisma.item.findUnique({ where: { id } });
    }
}