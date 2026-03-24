import { prisma } from "../../lib/prisma";
import { CreateOrderBody } from "./order.model";
import { OrderStatus } from "../../generated/prisma/enums";

export const OrderRepository = {
    create(data: CreateOrderBody){
        return prisma.order.create({
            data: {
                userId: data.userId,
                stripeSessionId: data.stripeSessionId,
                total: data.total,
                items: {
                    create: data.items
                }
            },
            include: { items: true }
        });
    },
    listByUser(userId: string) {
        return prisma.order.findMany({orderBy: { createdAt: "desc" }, where: { userId }, include: { items: true }});
    },
    getById(orderId: string) { 
        return prisma.order.findUnique({ where: { id: orderId }, include: { items: true }});
    },
    updateStatus(id: string, status: OrderStatus) {
        return prisma.order.update({
            where: { id }, 
            data: { status }
        });
    }
};
