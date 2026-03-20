import { CreateOrderBody } from "./order.model";
import { orderRepository } from "./order.repo"

export const orderService = {
    create: (body: CreateOrderBody) => {
        return orderRepository.create(body);
    },
    listByUser: (userId: string) => {
        return orderRepository.listByUser(userId);
    },
    getById: (orderId: string) => {
        return orderRepository.getById(orderId);
    }

}