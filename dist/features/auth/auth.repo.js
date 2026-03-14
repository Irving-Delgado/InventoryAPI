"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = void 0;
const prisma_1 = require("../../lib/prisma");
exports.authRepository = {
    findUserByEmail(email) {
        return prisma_1.prisma.user.findUnique({ where: { email } });
    },
    createUser(data) {
        return prisma_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: data.passwordHash,
                role: data.role ?? "USER",
            },
        });
    },
    async findAllUsers() {
        return prisma_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
};
