"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemRepository = void 0;
const prisma_1 = require("../../lib/prisma");
exports.itemRepository = {
    create(data) {
        return prisma_1.prisma.item.create({
            data: {
                ...data,
                sold: 0,
                price: data.price ?? 0,
                quantity: data.quantity ?? 0
            },
        });
    },
    list() {
        return prisma_1.prisma.item.findMany({ orderBy: { createdAt: "desc" } });
    },
    getById(id) {
        return prisma_1.prisma.item.findUnique({ where: { id } });
    },
    update(id, data) {
        return prisma_1.prisma.item.update({ where: { id }, data });
    },
    delete(id) {
        return prisma_1.prisma.item.delete({ where: { id } });
    },
    sellMany(id, quantity) {
        return prisma_1.prisma.item.update({
            where: { id },
            data: {
                sold: { increment: quantity },
                quantity: { decrement: quantity }
            }
        });
    }
};
