import { prisma } from "../../lib/prisma";
import { CreateShippingBody } from "./shipping.model";

export const ShippingRepository = {
    create(userId: string, data: CreateShippingBody) {
        return prisma.shippingAddress.create({
            data : {
                ...data,
                userId
            }
        }); 
    },
    list(userId: string) {
        return prisma.shippingAddress.findMany({ where: { userId } });
    },
    getById(id: string) {
        return prisma.shippingAddress.findUnique({ where: { id } });
    },
    update(id: string, data: Partial<CreateShippingBody>) {
        return prisma.shippingAddress.update({ where: { id }, data });
    },
    delete(id: string) {
        return prisma.shippingAddress.delete({ where: { id } });
    }
}