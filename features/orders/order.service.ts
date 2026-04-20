import { OrderStatus } from "../../generated/prisma/enums";
import { CreateOrderBody } from "./order.model";
import { OrderRepository } from "./order.repo"

export const orderService = {
    create: (body: CreateOrderBody) => {
        return OrderRepository.create(body);
    },
    listByUser: (userId: string, skip: number, limit: number) => {
        return OrderRepository.listByUser(userId, skip, limit);
    },
    getById: (orderId: string) => {
        return OrderRepository.getById(orderId);
    },
    updateStatus(id: string, status: OrderStatus){
        return OrderRepository.updateStatus(id, status);
    }
}